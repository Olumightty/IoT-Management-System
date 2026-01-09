export interface MetricsPoint {
  _time: string;
  voltage: number;
  current: number;
  power: number;
}

export interface MetricsResponse {
  status: boolean;
  message: string;
  data?: MetricsPoint[];
}

export interface LiveTelemetry {
  voltage: number;
  current: number;
  power: number;
  deviceId: string;
  appliance: string;
}
