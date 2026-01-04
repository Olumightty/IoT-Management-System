import { Module } from '@nestjs/common';
import { MqttController } from './mqtt.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MqttService } from './mqtt.service';
import { AnalyticsModule } from 'src/analytics/analytics.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApplianceModule } from 'src/repositories/appliance/appliance.module';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'MQTT_CLIENT',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('MQTT_HOST'),
            port: +configService.get<string>('MQTT_PORT')!,
            clientId: configService.get<string>('MQTT_CLIENT_ID'),
            protocolVersion: 5,
          },
        }),
        inject: [ConfigService],
      },
    ]),
    AnalyticsModule,
    ApplianceModule,
  ],
  controllers: [MqttController],
  exports: [ClientsModule, MqttService],
  providers: [MqttService],
})
export class MqttModule {}
