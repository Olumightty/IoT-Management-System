import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsGateway } from './analytics.gateway';
import { AnalyticsController } from './analytics.controller';
import { InfluxService } from './influx/influx.service';

@Module({
  providers: [AnalyticsGateway, AnalyticsService, InfluxService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
