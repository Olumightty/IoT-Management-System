import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AnalyticsService } from './analytics.service';
import { GetAnalyticsDto } from './dto/get-analytics.dto';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/auth/guard/ws.guard';
import { IoTDeviceService } from 'src/repositories/iotdevice/iotdevice.service';
import { OnEvent } from '@nestjs/event-emitter';

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: { origin: '*', credentials: true, methods: ['GET', 'POST'] },
  transports: ['websocket'], // In production, restrict this to your frontend URL
})
export class AnalyticsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly iotdeviceService: IoTDeviceService,
  ) {}

  handleConnection(client: Socket) {
    // Logic: When a user connects, join them to a 'room' based on their UserID
    // This ensures Data Isolation (User A doesn't see User B's live data)
    console.log('Client connected:', client.id);
  }

  @WebSocketServer()
  server: Server;

  @OnEvent('telemetry.received')
  handleLiveUpdate(payload: any) {
    const { deviceId, appliance, data } = payload;
    // Send to the specific room
    this.server
      .to(`device_${deviceId}:appliance_${appliance}`)
      .emit('liveTelemetry', {
        ...data,
        deviceId,
        appliance,
      });
  }

  @SubscribeMessage('query_metrics')
  async queryMetrics(
    @MessageBody() data: GetAnalyticsDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // console.log('Received query_metrics:', data);
      const userId = client.data['user'].sub as string;

      const ownsDevice = await this.iotdeviceService.findOne({
        id: data.deviceId,
        user_id: userId,
      });
      if (!ownsDevice) {
        throw new WsException('Unauthorized device access');
      }
      await client.join(`device_${data.deviceId}:appliance_${data.appliance}`); // Join device-specific room
      const results = await this.analyticsService.get(data);

      client.emit('metrics_response', results);
      return;
    } catch (error) {
      console.error('Error in queryMetrics:', error);
      throw new WsException('Failed to fetch metrics');
    }
  }

  // This method will be called by your Service

  handleDisconnect(client: Socket) {
    // Logic: When a user disconnects, remove them from their 'room'
    console.log('Client disconnected:', client.id);
  }
}
