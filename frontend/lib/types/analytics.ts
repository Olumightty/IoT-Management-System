export interface MetricsPoint {
  _time: string;
  voltage: number;
  current: number;
  power: number;
  temperature?: number;
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
  temperature?: number;
  deviceId: string;
  appliance: string;
}

export type DeviceHealthStatus = "healthy" | "idle" | "offline";

export interface AnomalyAlert {
  id: string;
  deviceId: string;
  appliance: string;
  message: string;
  timestamp: string;
}

export interface MaintenanceStatus {
  deviceId: string;
  appliance: string;
  runtimeHours: number;
  due: boolean;
  lastReset?: string;
  projectedServiceDate?: string; // New field
}