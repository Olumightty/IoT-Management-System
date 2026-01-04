import { Injectable } from '@nestjs/common';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import { GetAnalyticsDto } from './dto/get-analytics.dto';
import { InfluxService } from './influx/influx.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly influxService: InfluxService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  sendLiveUpdate(
    deviceId: string,
    appliance: string,
    data: { [key: string]: any },
  ) {
    //emit event for live update back to the websocket gateway
    this.eventEmitter.emit('telemetry.received', {
      deviceId: deviceId,
      appliance: appliance,
      data: data,
    });
    return true;
  }

  async create(createAnalyticsDto: CreateAnalyticsDto) {
    return await this.influxService.writeMetrics(createAnalyticsDto);
  }

  async get(data: GetAnalyticsDto) {
    return await this.influxService.queryMetrics(data);
  }
}
