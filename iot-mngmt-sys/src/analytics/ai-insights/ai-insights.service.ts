import { Injectable } from '@nestjs/common';
import { GetAnalyticsDto } from '../dto/get-analytics.dto';
import { InfluxService } from '../influx/influx.service';
import { ApplianceService } from 'src/repositories/appliance/appliance.service';
import { Analytics } from '../entities/analytics.entity';
import { AiProvider } from './ai.provider';

@Injectable()
export class AiInsightsService {
  constructor(
    private readonly influxService: InfluxService,
    private readonly applianceService: ApplianceService,
    private readonly aiProvider: AiProvider,
  ) {}

  async generateReport(data: GetAnalyticsDto) {
    const appliance = await this.applianceService.findOne({
      label: data.appliance,
      iot_device_id: data.deviceId,
    });

    const { data: results } = await this.influxService.queryMetrics(data);

    if (!results || results.length === 0) {
      return null;
    }

    if (!appliance) {
      return null;
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
      appliance.label,
      results,
      avgPower,
      maxTemp,
    );
    const billing = this.getBillingReport(results);

    return {
      summary: {
        avgPower: `${avgPower.toFixed(2)}W`,
        uptime,
        healthScore,
      },
      aiGen: aiResponse,
      billing,
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

  async getAiFuncCall(
    appliance: string,
    data: Analytics[],
    avgPower: number,
    maxTemp: number,
  ): Promise<{
    warnings: { type: string; severity: string; message: string }[];
    insights: string[];
    recommendations: string[];
  }> {
    // Simulated AI function call response
    const aiResponse = await this.aiProvider.generateResponse({
      appliance,
      telemetry: data,
      avgPower,
      maxTemp,
    });
    if (typeof aiResponse === 'string') {
      return {
        warnings: [],
        insights: [aiResponse],
        recommendations: [],
      };
    }
    return {
      warnings: aiResponse[0].args.warnings,
      insights: aiResponse[0].args.insights,
      recommendations: aiResponse[0].args.recommendations,
    };
  }

  getBillingReport(data: Analytics[]) {
    // 1. Calculate Total Energy (kWh)
    // Formula: (Average Power in Watts * Time in Hours) / 1000
    let totalKwh = 0;
    for (let i = 0; i < data.length; i++) {
      // We assume 1-minute intervals, or calculate the gap between logs
      const durationHours = 1 / 60;
      totalKwh += (data[i].power * durationHours) / 1000;
    }

    // 2. Financial Mapping (Using current Nigerian Band A rates as an example)
    const TARIFF = 209.5;
    const costConsumed = totalKwh * TARIFF;

    // 3. Pro-rata Forecasting
    const now = new Date();
    const daysPassed = now.getDate();
    const totalDaysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();
    const forecastedUnits = (totalKwh / daysPassed) * totalDaysInMonth;
    const forecastedCost = forecastedUnits * TARIFF;

    return {
      unitsConsumed: totalKwh,
      costofUnitsConsumed: costConsumed,
      monthlyForcastedUnitConsumed: forecastedUnits,
      monthlyForcatedCostofUnitsConsumed: forecastedCost,
    };
  }
}
