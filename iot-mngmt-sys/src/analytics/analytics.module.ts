import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsGateway } from './analytics.gateway';
import { AnalyticsController } from './analytics.controller';
import { InfluxService } from './influx/influx.service';
import { IoTDeviceModule } from 'src/repositories/iotdevice/iotdevice.module';

@Module({
  imports: [IoTDeviceModule],
  providers: [AnalyticsGateway, AnalyticsService, InfluxService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService, InfluxService],
})
export class AnalyticsModule {}
