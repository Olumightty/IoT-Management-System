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

export interface InsightWarning {
  type: string;
  severity: string;
  message: string;
}

export interface InsightSummary {
  avgPower: string;
  uptime: string;
  healthScore: number;
}

export interface InsightAiGen {
  warnings: InsightWarning[];
  insights: string[];
  recommendations: string[];
}

export interface InsightReport {
  summary: InsightSummary;
  aiGen: InsightAiGen;
  billing: {
    unitsConsumed: number;
    costofUnitsConsumed: number;
    monthlyForcastedUnitConsumed: number;
    monthlyForcatedCostofUnitsConsumed: number;
  };
}

export interface InsightsResponse {
  message: string;
  status: boolean;
  report: InsightReport | null;
}
