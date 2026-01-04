import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { TelemetryDataDto } from './dto/telemetry-data.dto';
import { ApplianceService } from 'src/repositories/appliance/appliance.service';

@Injectable()
export class MqttService {
  constructor(
    private readonly analyticsService: AnalyticsService,
    @Inject('MQTT_CLIENT') private readonly client: ClientProxy,
    private readonly applianceService: ApplianceService,
  ) {}
  async processTelemetryMessage(
    deviceId: string,
    appliance: string,
    data: TelemetryDataDto,
  ) {
    // Process and store telemetry data in InfluxDB
    const exists = await this.applianceService.findOne({
      iot_device_id: deviceId,
      label: appliance,
    });
    if (!exists) {
      console.warn(
        `Received telemetry for unknown appliance ${appliance} on device ${deviceId}`,
      );
      return false;
    }
    await this.analyticsService.create({ ...data, deviceId, appliance });
    return this.analyticsService.sendLiveUpdate(deviceId, appliance, data);
  }

  publishCommand(deviceId: string, appliance: string, command: any) {
    this.client.emit(`cmnd/${deviceId}/${appliance}/state`, command);
  }
}
