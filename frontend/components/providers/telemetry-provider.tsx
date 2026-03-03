"use client";

import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  AnomalyAlert,
  DeviceHealthStatus,
  LiveTelemetry,
  MaintenanceStatus,
  MetricsPoint,
} from "@/lib/types/analytics";
import { useSocket } from "./socket-provider";

const MAX_BUFFER_POINTS = 2000;
const MAINTENANCE_THRESHOLD_HOURS = 500;
const MAINTENANCE_POWER_THRESHOLD = 5;

interface TelemetryRange {
  from: string;
  to: string;
}

interface TelemetryChannel {
  deviceId: string;
  appliance: string;
  range: TelemetryRange;
}

interface TelemetryContextValue {
  metrics: MetricsPoint[];
  liveData: LiveTelemetry | null;
  deviceHealth: Record<string, DeviceHealthStatus>;
  lastHeartbeat: Record<string, string>;
  anomalies: AnomalyAlert[];
  maintenanceStatus: MaintenanceStatus[];
  activeChannel: TelemetryChannel | null;
  setActiveChannel: (channel: TelemetryChannel | null) => void;
  dismissAnomaly: (id: string) => void;
  resetMaintenance: (deviceId: string, appliance: string) => void;
}

const TelemetryContext = createContext<TelemetryContextValue | undefined>(
  undefined,
);

function getHealthStatus(lastSeen: number): DeviceHealthStatus {
  const minutes = (Date.now() - lastSeen) / (1000 * 60);
  if (minutes < 5) return "healthy";
  if (minutes < 20) return "idle";
  if (minutes > 60) return "offline";
  return "idle";
}

function trimMetrics(points: MetricsPoint[]): MetricsPoint[] {
  if (points.length <= MAX_BUFFER_POINTS) {
    return points;
  }
  return points.slice(points.length - MAX_BUFFER_POINTS);
}

function getChannelKey(deviceId: string, appliance: string) {
  return `${deviceId}::${appliance}`;
}

export function TelemetryProvider({ children }: PropsWithChildren) {
  const { socket, isConnected } = useSocket();
  const [metrics, setMetrics] = useState<MetricsPoint[]>([]);
  const [liveData, setLiveData] = useState<LiveTelemetry | null>(null);
  const [deviceHealth, setDeviceHealth] = useState<
    Record<string, DeviceHealthStatus>
  >({});
  const [lastHeartbeat, setLastHeartbeat] = useState<Record<string, string>>(
    {},
  );
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [maintenanceStatus, setMaintenanceStatus] = useState<
    MaintenanceStatus[]
  >([]);
  const [activeChannel, setActiveChannel] =
    useState<TelemetryChannel | null>(null);
  const runtimeRef = useRef<
    Record<
      string,
      { runtimeHours: number; lastSampleAt?: number; lastReset?: string }
    >
  >({});

  const handleMetricsResponse = useCallback((payload: unknown) => {
    const parsed = payload as {
      status?: boolean;
      message?: string;
      data?: MetricsPoint[];
    };

    if (!parsed?.status || !parsed.data) {
      setMetrics([]);
      return;
    }

    setMetrics(trimMetrics(parsed.data));
  }, []);

  const handleLiveTelemetry = useCallback(
    (payload: unknown) => {
      const candidate = payload as LiveTelemetry;
      if (
        !candidate ||
        typeof candidate !== "object" ||
        typeof candidate.deviceId !== "string" ||
        typeof candidate.appliance !== "string"
      ) {
        return;
      }

      setLiveData(candidate);
      const now = Date.now();
      setLastHeartbeat((prev) => ({
        ...prev,
        [candidate.deviceId]: new Date(now).toISOString(),
      }));
      setDeviceHealth((prev) => ({
        ...prev,
        [candidate.deviceId]: getHealthStatus(now),
      }));

      if (
        activeChannel &&
        candidate.deviceId === activeChannel.deviceId &&
        candidate.appliance === activeChannel.appliance
      ) {
        const nextPoint: MetricsPoint = {
          _time: new Date(now).toISOString(),
          power: candidate.power,
          current: candidate.current,
          voltage: candidate.voltage,
          temperature: candidate.temperature,
        };
        setMetrics((prev) => trimMetrics([...prev, nextPoint]));
      }

      if (activeChannel) {
        const key = getChannelKey(
          activeChannel.deviceId,
          activeChannel.appliance,
        );
        const tracker = runtimeRef.current[key] ?? {
          runtimeHours: 0,
        };

        if (
          candidate.deviceId === activeChannel.deviceId &&
          candidate.appliance === activeChannel.appliance
        ) {
          if (candidate.power > MAINTENANCE_POWER_THRESHOLD) {
            if (tracker.lastSampleAt) {
              const deltaHours = (now - tracker.lastSampleAt) / 1000 / 60 / 60;
              tracker.runtimeHours += deltaHours;
            }
            tracker.lastSampleAt = now;
          } else {
            tracker.lastSampleAt = now;
          }

          runtimeRef.current[key] = tracker;
          setMaintenanceStatus((prev) => {
            const next = prev.filter(
              (entry) =>
                !(
                  entry.deviceId === activeChannel.deviceId &&
                  entry.appliance === activeChannel.appliance
                ),
            );
            next.push({
              deviceId: activeChannel.deviceId,
              appliance: activeChannel.appliance,
              runtimeHours: Number(tracker.runtimeHours.toFixed(1)),
              due: tracker.runtimeHours >= MAINTENANCE_THRESHOLD_HOURS,
              lastReset: tracker.lastReset,
            });
            return next;
          });
        }
      }
    },
    [activeChannel],
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("metrics_response", handleMetricsResponse);
    socket.on("liveTelemetry", handleLiveTelemetry);

    return () => {
      socket.off("metrics_response", handleMetricsResponse);
      socket.off("liveTelemetry", handleLiveTelemetry);
    };
  }, [handleLiveTelemetry, handleMetricsResponse, socket]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDeviceHealth((prev) => {
        const next: Record<string, DeviceHealthStatus> = { ...prev };
        Object.entries(lastHeartbeat).forEach(([deviceId, timestamp]) => {
          const lastSeen = new Date(timestamp).getTime();
          if (!Number.isNaN(lastSeen)) {
            next[deviceId] = getHealthStatus(lastSeen);
          }
        });
        return next;
      });
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [lastHeartbeat]);

  useEffect(() => {
    if (!socket || !isConnected || !activeChannel) {
      return;
    }

    setMetrics([]);
    socket.emit("query_metrics", {
      deviceId: activeChannel.deviceId,
      appliance: activeChannel.appliance,
      from: activeChannel.range.from,
      to: activeChannel.range.to,
    });
  }, [activeChannel, isConnected, socket]);

  useEffect(() => {
    if (!liveData || metrics.length === 0 || !activeChannel) return;
    if (
      liveData.deviceId !== activeChannel.deviceId ||
      liveData.appliance !== activeChannel.appliance
    ) {
      return;
    }

    const average =
      metrics.reduce((sum, point) => sum + point.power, 0) / metrics.length;
    if (average > 0 && liveData.power > average * 1.5) {
      const anomaly: AnomalyAlert = {
        id: `${liveData.deviceId}-${liveData.appliance}-${Date.now()}`,
        deviceId: liveData.deviceId,
        appliance: liveData.appliance,
        message:
          "High power draw detected. Check appliance for mechanical strain.",
        timestamp: new Date().toISOString(),
      };
      setAnomalies((prev) => [anomaly, ...prev].slice(0, 20));
    }
  }, [activeChannel, liveData, metrics]);

  const dismissAnomaly = useCallback((id: string) => {
    setAnomalies((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const resetMaintenance = useCallback((deviceId: string, appliance: string) => {
    const key = getChannelKey(deviceId, appliance);
    runtimeRef.current[key] = {
      runtimeHours: 0,
      lastReset: new Date().toISOString(),
    };
    setMaintenanceStatus((prev) =>
      prev.map((entry) =>
        entry.deviceId === deviceId && entry.appliance === appliance
          ? {
              ...entry,
              runtimeHours: 0,
              due: false,
              lastReset: runtimeRef.current[key].lastReset,
            }
          : entry,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({
      metrics,
      liveData,
      deviceHealth,
      lastHeartbeat,
      anomalies,
      maintenanceStatus,
      activeChannel,
      setActiveChannel,
      dismissAnomaly,
      resetMaintenance,
    }),
    [
      activeChannel,
      anomalies,
      deviceHealth,
      lastHeartbeat,
      liveData,
      maintenanceStatus,
      metrics,
      dismissAnomaly,
      resetMaintenance,
    ],
  );

  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry(): TelemetryContextValue {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }
  return context;
}
