import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DevicesModule } from './devices/devices.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MqttModule } from './mqtt/mqtt.module';
import { ControlModule } from './control/control.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    DevicesModule,
    AnalyticsModule,
    MqttModule,
    ControlModule,
    ConfigModule.forRoot({ isGlobal: true }), //injects environment variables
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
