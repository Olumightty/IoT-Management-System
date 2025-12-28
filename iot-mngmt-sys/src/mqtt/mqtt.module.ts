import { Module } from '@nestjs/common';
import { MqttController } from './mqtt.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MqttService } from './mqtt.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MQTT_CLIENT',
        transport: Transport.MQTT,
        options: {
          url: 'mqtt://localhost:1883',
        },
      },
    ]),
  ],
  controllers: [MqttController],
  exports: [ClientsModule],
  providers: [MqttService],
})
export class MqttModule {}
