"use client";

import { useEffect, useMemo, useState } from "react";
import type { Appliance, Device } from "@/lib/types/device";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useTelemetry } from "@/components/providers/telemetry-provider";
import { useSocket } from "@/components/providers/socket-provider";
import { BrushTelemetryChart } from "./brush-telemetry-chart";
import { MultiAxisTelemetryChart } from "./multi-axis-telemetry-chart";
import { TemperatureHeatmapCard } from "./temperature-heatmap-card";
import { BudgetProgressBar } from "./budget-progress-bar";
import { AnomalyCard } from "./anomaly-card";
import { MaintenanceCard } from "./maintenance-card";
import { ControlPanel } from "@/components/features/dashboard/control-panel";

type RangeKey = "24h" | "7d" | "30d";

const RANGE_MAP: Record<RangeKey, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

const NIGERIAN_TARIFF = 65;
const DEFAULT_GOAL_KWH = 500;

function getRange(rangeKey: RangeKey) {
  const to = Date.now();
  const from = to - RANGE_MAP[rangeKey];
  return { from: new Date(from).toISOString(), to: new Date(to).toISOString() };
}

export function ApplianceDetail({
  device,
  appliance,
}: {
  device: Device;
  appliance: Appliance;
}) {
  const [rangeKey, setRangeKey] = useState<RangeKey>("24h");
  const range = useMemo(() => getRange(rangeKey), [rangeKey]);
  const { lastError } = useSocket();
  const {
    metrics,
    liveData,
    anomalies,
    maintenanceStatus,
    setActiveChannel,
    dismissAnomaly,
    resetMaintenance,
  } = useTelemetry();

  useEffect(() => {
    setActiveChannel({
      deviceId: device.id,
      appliance: appliance.label,
      range,
    });
  }, [appliance.label, device.id, range, setActiveChannel]);

  const averagePower =
    metrics.length > 0
      ? metrics.reduce((sum, point) => sum + point.power, 0) / metrics.length
      : 0;
  const averagePowerKw = averagePower / 1000;
  const rangeHours = RANGE_MAP[rangeKey] / 1000 / 60 / 60;
  const currentUsage = averagePowerKw * rangeHours;
  const projectedBill = averagePowerKw * NIGERIAN_TARIFF * 30;

  const latestTemperature =
    liveData?.deviceId === device.id && liveData?.appliance === appliance.label
      ? liveData.temperature ?? null
      : metrics[metrics.length - 1]?.temperature ?? null;

  const activeMaintenance = maintenanceStatus.find(
    (entry) =>
      entry.deviceId === device.id && entry.appliance === appliance.label,
  );

  const applianceAnomalies = anomalies.filter(
    (alert) =>
      alert.deviceId === device.id && alert.appliance === appliance.label,
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: device.label, href: `/devices/${device.id}` },
          { label: appliance.label },
        ]}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">
            {appliance.label}
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Appliance telemetry and AI insights
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(RANGE_MAP) as RangeKey[]).map((key) => (
            <Button
              key={key}
              size="sm"
              variant={rangeKey === key ? "primary" : "ghost"}
              onClick={() => setRangeKey(key)}
            >
              {key.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <Card title="Telemetry Overview" description="Brush timeline controls">
        {lastError && lastError.toLowerCase().includes("unauthorized") ? (
          <Alert variant="error">
            Device Unauthorized: telemetry access denied.
          </Alert>
        ) : null}
        {metrics.length === 0 ? (
          <Alert variant="info">
            Waiting for telemetry. Switch the range or ensure the device is
            sending data.
          </Alert>
        ) : (
          <BrushTelemetryChart data={metrics} />
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Electrical Correlation" description="Voltage vs current">
          {metrics.length === 0 ? (
            <Alert variant="info">No telemetry yet for this range.</Alert>
          ) : (
            <MultiAxisTelemetryChart data={metrics} />
          )}
        </Card>
        <div className="space-y-4">
          <TemperatureHeatmapCard temperature={latestTemperature} />
          {activeMaintenance ? (
            <MaintenanceCard status={activeMaintenance} onReset={resetMaintenance} />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-slate-50">Maintenance</p>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Runtime tracking will appear once telemetry streams.
              </p>
            </div>
          )}
        </div>
      </div>

      <Card title="AI Insights" description="Predictive billing and alerts">
        <div className="grid gap-6 lg:grid-cols-2">
          <BudgetProgressBar
            projectedBill={projectedBill}
            currentUsage={currentUsage}
            goal={DEFAULT_GOAL_KWH}
          />
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-slate-50">Billing Summary</p>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                Avg power {averagePower.toFixed(2)} W · Tariff {NIGERIAN_TARIFF} NGN/kWh
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-slate-50">Anomaly Rule</p>
              <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                Trigger when current usage exceeds 1.5x average.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {applianceAnomalies.length ? (
        <Card title="Anomaly Alerts" description="Recent warnings">
          <div className="space-y-3">
            {applianceAnomalies.map((alert) => (
              <AnomalyCard
                key={alert.id}
                anomaly={alert}
                onDismiss={dismissAnomaly}
              />
            ))}
          </div>
        </Card>
      ) : null}

      <ControlPanel deviceId={device.id} appliance={appliance.label} />
    </div>
  );
}
