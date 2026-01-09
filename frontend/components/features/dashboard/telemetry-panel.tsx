"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TelemetryChart } from "./telemetry-chart";
import { useSocket } from "@/components/providers/socket-provider";
import { useTelemetryChannel } from "./use-telemetry-channel";
import type { LiveTelemetry, MetricsPoint } from "@/lib/types/analytics";

type RangeKey = "1h" | "12h" | "24h";

const RANGE_MAP: Record<RangeKey, number> = {
  "1h": 60 * 60 * 1000,
  "12h": 12 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
};

interface TelemetryPanelProps {
  deviceId: string | null;
  appliance: string | null;
}

function getRangeTimestamps(rangeKey: RangeKey) {
  const to = Date.now();
  const from = to - RANGE_MAP[rangeKey];
  return {
    fromIso: new Date(from).toISOString(),
    toIso: new Date(to).toISOString(),
  };
}

function StatTile({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null;
  unit: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-50">
        {value !== null ? value.toFixed(2) : "—"}{" "}
        <span className="text-sm text-[var(--color-muted-foreground)]">
          {unit}
        </span>
      </p>
    </div>
  );
}

export function TelemetryPanel({ deviceId, appliance }: TelemetryPanelProps) {
  const { socket, isConnected, lastError } = useSocket();
  const [history, setHistory] = useState<MetricsPoint[]>([]);
  const [rangeKey, setRangeKey] = useState<RangeKey>("1h");
  const { fromIso, toIso } = useMemo(
    () => getRangeTimestamps(rangeKey),
    [rangeKey],
  );

  // Keep telemetry synced to the current range/device/appliance via the websocket hook.
  const { metrics, liveReading, status, error } = useTelemetryChannel({
    socket,
    deviceId,
    appliance,
    from: fromIso,
    to: toIso,
  });

  useEffect(() => {
    setHistory(metrics);
  }, [metrics]);


  // Stream live telemetry to the history for dynamic updates
  useEffect(() => {
    if (liveReading) {
      setHistory((prev) => [...prev, {
        current: liveReading.current,
        power: liveReading.power,
        voltage: liveReading.voltage,
        _time: new Date().toISOString(),
      }]);
    }
  }, [liveReading]);

  const latest = useMemo<MetricsPoint | null>(() => {
    if (metrics.length === 0) {
      return null;
    }
    return metrics[metrics.length - 1];
  }, [metrics]);

  const checkIfForAppliance = (liveReading: LiveTelemetry | null) => {
    if(!liveReading) return latest
    if(liveReading.appliance !== appliance && liveReading.deviceId === deviceId) {
      return null
    }
    return liveReading
  }

  const activeValues = checkIfForAppliance(liveReading) ?? latest;

  return (
    <Card
      title="Telemetry"
      description="Historical metrics with live streaming updates"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "accent" : "warning"}>
            {isConnected ? "Socket connected" : "Waiting for socket"}
          </Badge>
          {appliance ? (
            <Badge variant="muted">Channel: {appliance}</Badge>
          ) : null}
        </div>
        <div className="flex gap-2">
          {(Object.keys(RANGE_MAP) as RangeKey[]).map((key) => (
            <Button
              key={key}
              variant={rangeKey === key ? "primary" : "ghost"}
              size="sm"
              onClick={() => setRangeKey(key)}
            >
              {key.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {lastError ? <Alert variant="error">{lastError}</Alert> : null}
      {error ? (
        <Alert variant={status === "error" ? "error" : "info"}>{error}</Alert>
      ) : null}
      {!deviceId || !appliance ? (
        <Alert variant="info">
          Select a device and appliance to load telemetry and live readings.
        </Alert>
      ) : null}

      {status === "loading" ? (
        <Skeleton className="mt-4 h-80 w-full" />
      ) : null}
      {status === "ready" && metrics.length === 0 ? (
        <Alert variant="info">
          No telemetry available for this range. Try a wider window.
        </Alert>
      ) : null}
      {metrics.length > 0 ? (
        <div className="mt-2">
          <TelemetryChart data={history} />
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatTile label="Power" value={activeValues?.power ?? null} unit="W" />
        <StatTile
          label="Voltage"
          value={activeValues?.voltage ?? null}
          unit="V"
        />
        <StatTile
          label="Current"
          value={activeValues?.current ?? null}
          unit="A"
        />
      </div>
    </Card>
  );
}
