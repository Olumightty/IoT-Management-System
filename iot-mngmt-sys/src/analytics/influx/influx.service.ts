import {
  FluxTableMetaData,
  InfluxDB,
  Point,
  QueryApi,
  WriteApi,
} from '@influxdata/influxdb-client';
import { Injectable } from '@nestjs/common';
import { CreateAnalyticsDto } from '../dto/create-analytics.dto';
import { GetAnalyticsDto } from '../dto/get-analytics.dto';

@Injectable()
export class InfluxService {
  private client: InfluxDB;
  private writeApi: WriteApi;
  private queryApi: QueryApi;
  constructor() {
    this.client = new InfluxDB({
      url: process.env.INFLUX_URL || 'http://localhost:8086',
      token: process.env.INFLUX_TOKEN || '',
    });
    this.writeApi = this.client.getWriteApi(
      process.env.INFLUX_ORG!,
      process.env.INFLUX_BUCKET!,
      'ns',
    );
    this.queryApi = this.client.getQueryApi(process.env.INFLUX_ORG!);
  }

  async writeMetrics(data: CreateAnalyticsDto) {
    try {
      const point = new Point('energy_metrics')
        .tag('deviceId', data.deviceId)
        .tag('appliance', data.appliance)
        .floatField('voltage', data.voltage)
        .floatField('current', data.current)
        .floatField('power', data.power);

      this.writeApi.writePoint(point);
      await this.writeApi.flush();

      return { message: 'Metrics written to InfluxDB', status: true };
    } catch (error) {
      console.error('Error writing metrics to InfluxDB:', error);
      return { message: 'Failed to write metrics to InfluxDB', status: false };
    }
  }

  async queryMetrics(data: GetAnalyticsDto) {
    try {
      const results: { [key: string]: any }[] = [];
      const query = `from(bucket: "${process.env.INFLUX_BUCKET}")
        |> range(start: ${new Date(data.from).toISOString()}, stop: ${new Date(data.to).toISOString()})
        |> filter(fn: (r) => r._measurement == "energy_metrics" and r.deviceId == "${data.deviceId}" and r.appliance == "${data.appliance}")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> keep(columns: ["_time", "voltage", "current", "power"])`;

      // Await for the query to complete and Execute the query and process results
      await new Promise((resolve, reject) => {
        this.queryApi.queryRows(query, {
          next(row: string[], tableMeta: FluxTableMetaData) {
            const o = tableMeta.toObject(row);
            results.push(o);
          },
          error(error: any) {
            console.error('Query error:', error);
            reject(error);
          },
          complete() {
            console.log('Query completed');
            resolve(true);
          },
        });
      });

      return {
        data: results,
        message: 'Metrics retrieved from InfluxDB',
        status: true,
      };
    } catch (error) {
      console.error('Error querying metrics from InfluxDB:', error);
      return {
        message: 'Failed to query metrics from InfluxDB',
        status: false,
      };
    }
  }
}
