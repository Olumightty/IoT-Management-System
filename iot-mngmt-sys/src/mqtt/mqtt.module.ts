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
          transport: Transport.MQTT,
          options: {
            host: configService.get<string>('MQTT_HOST'),
            port: +configService.get<string>('MQTT_PORT')!,
            clientId: configService.get<string>('MQTT_CLIENT_ID') + '_pub',
            protocolVersion: 5,
            username: configService.get<string>('MQTT_USERNAME'),
            password: configService.get<string>('MQTT_PASSWORD'),
            reconnectPeriod: 5000, // Reconnect every 5 seconds if disconnected
          },
        }),
        inject: [ConfigService],
      },
    ]), //setup client for publishing commands, it must be different from the one used for subscribing to avoid conflicts
    AnalyticsModule,
    ApplianceModule,
  ],
  controllers: [MqttController],
  exports: [ClientsModule, MqttService],
  providers: [MqttService],
})
export class MqttModule {}
