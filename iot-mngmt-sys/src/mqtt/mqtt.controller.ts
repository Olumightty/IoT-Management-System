import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  MqttContext,
  Payload,
} from '@nestjs/microservices';
import { MqttService } from './mqtt.service';
import { TelemetryDataDto } from './dto/telemetry-data.dto';

@Controller()
export class MqttController {
  constructor(private readonly mqttService: MqttService) {}
  @MessagePattern('energy/+/+/telemetry')
  async getNotifications(@Payload() data: TelemetryDataDto, @Ctx() context: MqttContext) {
    const deviceId = context.getTopic().split('/')[1];
    const appliance = context.getTopic().split('/')[2];
    await this.mqttService.processTelemetryMessage(deviceId, appliance, data);
    console.log(
      `Telemetry received from device ${deviceId}, appliance ${appliance}:`,
      data,
    );
  }
}
