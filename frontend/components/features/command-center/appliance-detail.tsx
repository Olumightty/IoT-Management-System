"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Appliance, Device } from "@/lib/types/device";
import type { InsightReport, InsightWarning } from "@/lib/types/analytics";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTelemetry } from "@/components/providers/telemetry-provider";
import { useSocket } from "@/components/providers/socket-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { removeAppliance, updateAppliance } from "@/lib/api/devices";
import { BrushTelemetryChart } from "./brush-telemetry-chart";
import { MultiAxisTelemetryChart } from "./multi-axis-telemetry-chart";
import { TemperatureHeatmapCard } from "./temperature-heatmap-card";
import { BudgetProgressBar } from "./budget-progress-bar";
import { AnomalyCard } from "./anomaly-card";
import { MaintenanceCard } from "./maintenance-card";
import { ControlPanel } from "@/components/features/dashboard/control-panel";
import { getInsights } from "@/lib/api/analytics";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ui/confirm-modal";

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

function getSeverityVariant(severity: string): "warning" | "muted" {
  const normalized = severity.toLowerCase();
  if (normalized.includes("high") || normalized.includes("critical") || normalized.includes("severe")) {
    return "warning";
  }
  if (normalized.includes("medium")) {
    return "warning";
  }
  return "muted";
}

function getHealthTone(score: number): { label: string; variant: "accent" | "warning" | "muted" } {
  if (score >= 85) {
    return { label: "Excellent", variant: "accent" };
  }
  if (score >= 65) {
    return { label: "Fair", variant: "warning" };
  }
  return { label: "Attention", variant: "warning" };
}

function formatWarningLabel(warning: InsightWarning) {
  const severity = warning.severity?.trim() || "unknown";
  return `${warning.type ?? "Alert"} · ${severity}`;
}

function formatNaira(value: number) {
  return `NGN ${value.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export function ApplianceDetail({
  device,
  appliance,
}: {
  device: Device;
  appliance: Appliance;
}) {
  const [applianceState, setApplianceState] = useState<Appliance>(appliance);
  const [ratedPowerInput, setRatedPowerInput] = useState<string>(
    appliance.rated_power ? String(appliance.rated_power) : "",
  );
  const [monthlyUsageInput, setMonthlyUsageInput] = useState<string>(
    appliance.monthly_usage ? String(appliance.monthly_usage) : "",
  );
  const [applianceSaveState, setApplianceSaveState] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [applianceSaveMessage, setApplianceSaveMessage] = useState<string | null>(
    null,
  );
  const [ratedPowerError, setRatedPowerError] = useState<string | null>(null);
  const [monthlyUsageError, setMonthlyUsageError] = useState<string | null>(null);
  const [deleteState, setDeleteState] = useState<"idle" | "deleting" | "error">(
    "idle",
  );
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rangeKey, setRangeKey] = useState<RangeKey>("24h");
  const range = useMemo(() => getRange(rangeKey), [rangeKey]);
  const { lastError } = useSocket();
  const { apiClient } = useAuth();
  const router = useRouter();
  const [insights, setInsights] = useState<InsightReport | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
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

  const fetchInsights = useCallback(async () => {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const report = await getInsights(apiClient, device.id, appliance.label);
      setInsights(report);
    } catch {
      setInsightsError("Unable to load the AI insight report right now.");
      setInsights(null);
    } finally {
      setInsightsLoading(false);
    }
  }, [apiClient, appliance.label, device.id]);

  useEffect(() => {
    let isActive = true;
    (async () => {
      if (!isActive) return;
      await fetchInsights();
    })();
    return () => {
      isActive = false;
    };
  }, [fetchInsights]);

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

  const healthTone = insights ? getHealthTone(insights.summary.healthScore) : null;
  const billing = insights?.billing;
  const billingUsage = billing?.unitsConsumed ?? currentUsage;
  const billingProjected =
    billing?.monthlyForcatedCostofUnitsConsumed ?? projectedBill;
  const billingGoal =
    billing?.monthlyForcastedUnitConsumed ?? DEFAULT_GOAL_KWH;
  const usageGoal = applianceState.monthly_usage ?? billingGoal;
  const billingTrend = billing
    ? (() => {
        const baseline = billing.unitsConsumed * (30 / 7);
        if (baseline <= 0) return null;
        const delta = billing.monthlyForcastedUnitConsumed - baseline;
        const pct = (delta / baseline) * 100;
        return { pct, direction: pct >= 0 ? "up" : "down" };
      })()
    : null;

  const handleApplianceUpdate = async () => {
    setApplianceSaveState("saving");
    setApplianceSaveMessage(null);
    setRatedPowerError(null);
    setMonthlyUsageError(null);
    const payload: {
      rated_power?: number;
      monthly_usage?: number;
    } = {};

    const ratedPowerValue = Number(ratedPowerInput);
    if (ratedPowerInput.trim().length > 0) {
      if (Number.isNaN(ratedPowerValue) || ratedPowerValue <= 0) {
        setRatedPowerError("Rated power must be greater than 0.");
      } else {
        payload.rated_power = ratedPowerValue;
      }
    }

    if (monthlyUsageInput.trim().length > 0) {
      const monthlyUsageValue = Number(monthlyUsageInput);
      if (Number.isNaN(monthlyUsageValue) || monthlyUsageValue < 0) {
        setMonthlyUsageError("Monthly usage must be 0 or greater.");
      } else {
        payload.monthly_usage = monthlyUsageValue;
      }
    }

    if (Object.keys(payload).length === 0) {
      setApplianceSaveState("error");
      setApplianceSaveMessage("Provide a rated power or monthly usage value.");
      return;
    }

    try {
      const updated = await updateAppliance(
        apiClient,
        device.id,
        appliance.label,
        payload,
      );
      setApplianceState(updated);
      setRatedPowerInput(String(updated.rated_power));
      setMonthlyUsageInput(
        updated.monthly_usage !== undefined
          ? String(updated.monthly_usage)
          : "",
      );
      setApplianceSaveState("success");
      setApplianceSaveMessage("Appliance updated successfully.");
    } catch {
      setApplianceSaveState("error");
      setApplianceSaveMessage("Unable to update appliance right now.");
    }
  };

  const handleDeleteAppliance = async () => {
    setDeleteState("deleting");
    try {
      await removeAppliance(apiClient, device.id, applianceState.label);
      router.push(`/devices/${device.id}`);
    } catch {
      setDeleteState("error");
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmModal
        open={deleteOpen}
        title="Delete appliance?"
        description={`This will permanently remove ${applianceState.label}.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteAppliance}
        onCancel={() => setDeleteOpen(false)}
        loading={deleteState === "deleting"}
      />
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
            projectedBill={billingProjected}
            currentUsage={billingUsage}
            goal={usageGoal}
          />
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-slate-50">Billing Summary</p>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                {billing ? (
                  <>
                    {billing.unitsConsumed.toFixed(2)} kWh used ·{" "}
                    {formatNaira(billing.costofUnitsConsumed)} spent
                  </>
                ) : (
                  <>
                    Avg power {averagePower.toFixed(2)} W · Tariff {NIGERIAN_TARIFF} NGN/kWh
                  </>
                )}
              </p>
              {billing ? (
                <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                  Forecast: {billing.monthlyForcastedUnitConsumed.toFixed(1)} kWh ·{" "}
                  {formatNaira(billing.monthlyForcatedCostofUnitsConsumed)} / month
                </p>
              ) : null}
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

      <Card
        title="AI Insight Report"
        description="7-day intelligence summary generated from historical telemetry."
        action={
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchInsights}
            disabled={insightsLoading}
            aria-label="Refresh AI insight report"
          >
            <RefreshCw
              size={16}
              className={insightsLoading ? "animate-spin" : ""}
            />
          </Button>
        }
      >
        {insightsLoading ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ) : insightsError ? (
          <Alert variant="error">{insightsError}</Alert>
        ) : !insights ? (
          <Alert variant="info">
            No AI report is available yet. Ensure this appliance has telemetry
            data recorded over the last 7 days.
          </Alert>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Avg Power
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-50">
                  {insights.summary.avgPower}
                </p>
                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                  Mean draw across the last 7 days.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Uptime
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-50">
                  {insights.summary.uptime}
                </p>
                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                  Estimated active duration window.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Health Score
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-2xl font-semibold text-slate-50">
                    {insights.summary.healthScore}
                  </p>
                  {healthTone ? (
                    <Badge variant={healthTone.variant}>{healthTone.label}</Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                  Thermal and power deviation heuristic.
                </p>
              </div>
            </div>

            {billing ? (
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Units Consumed
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-50">
                    {billing.unitsConsumed.toFixed(2)} kWh
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Cost So Far
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-50">
                    {formatNaira(billing.costofUnitsConsumed)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Monthly Forecast (kWh)
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-50">
                    {billing.monthlyForcastedUnitConsumed.toFixed(1)} kWh
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Monthly Forecast (NGN)
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-50">
                    {formatNaira(billing.monthlyForcatedCostofUnitsConsumed)}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-3 lg:col-span-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-50">Warnings</p>
                    <Badge variant="muted">
                      {insights.aiGen.warnings.length} flagged
                    </Badge>
                  </div>
                  {insights.aiGen.warnings.length === 0 ? (
                    <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
                      No critical warnings detected for this period.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {insights.aiGen.warnings.map((warning, index) => (
                        <div
                          key={`${warning.type}-${index}`}
                          className="rounded-xl border border-white/10 bg-white/5 p-3"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={getSeverityVariant(warning.severity)}>
                              {formatWarningLabel(warning)}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-slate-100">
                            {warning.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-50">Insights</p>
                    <Badge variant="muted">{insights.aiGen.insights.length}</Badge>
                  </div>
                  {insights.aiGen.insights.length === 0 ? (
                    <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
                      Insight generation is still warming up for this appliance.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-2 text-sm text-slate-100">
                      {insights.aiGen.insights.map((item, index) => (
                        <li key={`${item}-${index}`} className="rounded-xl bg-white/5 p-3">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-50">
                    Recommendations
                  </p>
                  <Badge variant="muted">
                    {insights.aiGen.recommendations.length}
                  </Badge>
                </div>
                {insights.aiGen.recommendations.length === 0 ? (
                  <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
                    No AI recommendations yet. Keep streaming telemetry.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2 text-sm text-slate-100">
                    {insights.aiGen.recommendations.map((item, index) => (
                      <li key={`${item}-${index}`} className="rounded-xl bg-white/5 p-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
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

      <Card title="Update Appliance" description="Edit rated power and monthly usage">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-slate-200" htmlFor="rated_power_input">
              Rated power (W)
            </label>
            <input
              id="rated_power_input"
              type="number"
              min={0}
              step={0.1}
              value={ratedPowerInput}
              onChange={(event) => setRatedPowerInput(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-50 outline-none transition focus:border-emerald-400 focus:bg-white/10 focus:ring-2 focus:ring-emerald-300/50"
            />
            {ratedPowerError ? (
              <p className="text-xs font-medium text-rose-300">{ratedPowerError}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-200" htmlFor="monthly_usage_input">
              Monthly usage goal (kWh)
            </label>
            <input
              id="monthly_usage_input"
              type="number"
              min={0}
              step={0.1}
              value={monthlyUsageInput}
              onChange={(event) => setMonthlyUsageInput(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-50 outline-none transition focus:border-emerald-400 focus:bg-white/10 focus:ring-2 focus:ring-emerald-300/50"
            />
            {monthlyUsageError ? (
              <p className="text-xs font-medium text-rose-300">{monthlyUsageError}</p>
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={handleApplianceUpdate} disabled={applianceSaveState === "saving"}>
            {applianceSaveState === "saving" ? "Saving..." : "Save changes"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setDeleteOpen(true)}
            disabled={deleteState === "deleting"}
          >
            {deleteState === "deleting" ? "Deleting..." : "Delete appliance"}
          </Button>
          {applianceSaveMessage ? (
            <span
              className={`text-sm ${
                applianceSaveState === "success"
                  ? "text-emerald-200"
                  : "text-rose-200"
              }`}
            >
              {applianceSaveMessage}
            </span>
          ) : null}
          {deleteState === "error" ? (
            <span className="text-sm text-rose-200">
              Unable to delete appliance right now.
            </span>
          ) : null}
        </div>
      </Card>

      <ControlPanel deviceId={device.id} appliance={appliance.label} />
    </div>
  );
}
