import { Injectable } from '@nestjs/common';
import { GetAnalyticsDto } from '../dto/get-analytics.dto';
import { InfluxService } from '../influx/influx.service';
import { ApplianceService } from 'src/repositories/appliance/appliance.service';
import { Analytics } from '../entities/analytics.entity';

@Injectable()
export class AiInsightsService {
  constructor(
    private readonly influxService: InfluxService,
    private readonly applianceService: ApplianceService,
  ) {}

  async generateReport(data: GetAnalyticsDto) {
    const appliance = await this.applianceService.findOne({
      label: data.appliance,
      iot_device_id: data.deviceId,
    });

    const { data: results } = await this.influxService.queryMetrics(data);

    if (!results || results.length === 0) {
      return { message: 'No data available for insights', status: false };
    }

    if (!appliance) {
      return { message: 'Appliance not found', status: false };
    }

    const avgPower = results.reduce((a, b) => a + b.power, 0) / results.length;
    const maxTemp = Math.max(...results.map((d) => d.temperature ?? 0));
    const healthScore = this.calculateHealth(
      maxTemp,
      avgPower,
      appliance.rated_power,
    );
    const uptime = this.calculateUptime(results);

    // --- LLM Augmented Insights ---
    const aiResponse = await this.getAiFuncCall(
      appliance,
      results,
      avgPower,
      maxTemp,
    );

    return {
      summary: {
        avgPower: `${avgPower.toFixed(2)}W`,
        uptime,
        healthScore,
      },
      aiGen: aiResponse,
      message: 'Insights generated successfully',
      status: true,
    };
  }

  //Heuristic Engine
  calculateUptime(data: Analytics[]): string {
    // Count intervals where power > 5W
    const activeIntervals = data.filter((r) => r.power > 5).length;
    // If your sampling is every 10 seconds:
    const totalMinutes = (activeIntervals * 10) / 60;
    return `${Math.floor(totalMinutes / 60)}h ${Math.round(totalMinutes % 60)}m`;
  }

  calculateHealth(
    maxTemp: number,
    avgPower: number,
    ratedPower: number,
  ): number {
    let score = 100;
    if (maxTemp > 50) score -= 20;
    if (avgPower > ratedPower * 1.1) score -= 15;
    return Math.max(0, score);
  }

  async getAiFuncCall(appliance, data: Analytics[], avgPower, maxTemp): Promise<{
    warnings: { type: string; severity: string; message: string }[];
    insights: string[];
    recommendations: string[];
  }> {
    // Simulated AI function call response
    return {
      warnings: [],
      insights: [],
      recommendations: [],
    };
  }
}
