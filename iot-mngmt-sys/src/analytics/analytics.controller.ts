import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('insights/:deviceId/:appliance')
  @HttpCode(200)
  async getInsights(
    @Param('deviceId') deviceId: string,
    @Param('appliance') appliance: string,
  ) {
    const { data } = await this.analyticsService.get({
      deviceId,
      appliance,
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      to: new Date().toISOString(),
    });

    if (!data || data.length === 0) {
      return { message: 'No data available for insights', status: false };
    }
    // Perform simple analytics on the data (e.g., average power consumption)
    const insights = {
      averagePower:
        data.reduce((sum, entry) => sum + entry.power, 0) / data.length,
      maxPower: Math.max(...data.map(entry => entry.power)),
      minPower: Math.min(...data.map(entry => entry.power)),
    };
    //AI does something with insights here to generate more meaningful insights for the user, for example by comparing with historical data or providing recommendations based on the insights.
    return {
      message: 'Insights generated successfully',
      status: true,
      insights,
    };
  }
}
