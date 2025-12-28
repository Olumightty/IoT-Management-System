import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  MqttContext,
  Payload,
} from '@nestjs/microservices';
import { MqttService } from './mqtt.service';

@Controller()
export class MqttController {
  constructor(private readonly mqttService: MqttService) {}
  @MessagePattern('energy/+/+/telemetry')
  getNotifications(@Payload() data: number[], @Ctx() context: MqttContext) {
    console.log(`Topic: ${context.getTopic()}`);
  }
}
