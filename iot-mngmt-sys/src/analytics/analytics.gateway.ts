import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AnalyticsService } from './analytics.service';

@WebSocketGateway({
  cors: { origin: '*' }, // In production, restrict this to your frontend URL
})
export class AnalyticsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly analyticsService: AnalyticsService) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    // Logic: When a user connects, join them to a 'room' based on their UserID
    // This ensures Data Isolation (User A doesn't see User B's live data)
    const userId = client.handshake.query.userId as string;
    if (userId) {
      await client.join(`user_${userId}`);
      console.log(`User ${userId} joined their private live stream.`);
    }
  }

  // This method will be called by your Service
  sendLiveUpdate(userId: string, data: any) {
    this.server.to(`user_${userId}`).emit('liveTelemetry', data);
  }

  async handleDisconnect(client: Socket) {
    // Logic: When a user disconnects, remove them from their 'room'
    const userId = client.handshake.query.userId as string;
    if (userId) {
      await client.leave(`user_${userId}`);
      console.log(`User ${userId} left their private live stream.`);
    }
  }
}
