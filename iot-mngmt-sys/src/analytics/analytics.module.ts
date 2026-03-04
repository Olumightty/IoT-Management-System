import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsGateway } from './analytics.gateway';
import { AnalyticsController } from './analytics.controller';
import { InfluxService } from './influx/influx.service';
import { IoTDeviceModule } from 'src/repositories/iotdevice/iotdevice.module';
import { ApplianceModule } from 'src/repositories/appliance/appliance.module';
import { AiInsightsService } from './ai-insights/ai-insights.service';

@Module({
  imports: [IoTDeviceModule, ApplianceModule],
  providers: [
    AnalyticsGateway,
    AnalyticsService,
    InfluxService,
    AiInsightsService,
  ],
  controllers: [AnalyticsController],
  exports: [AnalyticsService, InfluxService],
})
export class AnalyticsModule {}
