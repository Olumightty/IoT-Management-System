"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Appliance, Device } from "@/lib/types/device";
import { useTelemetry } from "@/components/providers/telemetry-provider";
import { useSocket } from "@/components/providers/socket-provider";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DeviceHealthIndicator } from "./device-health-indicator";
import { StatusBadge } from "./status-badge";
import { KillSwitchToggle } from "./kill-switch-toggle";
import { GhostModeToggle } from "./ghost-mode-toggle";
import { TokenRotationCard } from "./token-rotation-card";
import { ApplianceCard } from "./appliance-card";
import { MaintenanceCard } from "./maintenance-card";
import { AnomalyCard } from "./anomaly-card";
import { CreateApplianceForm } from "@/components/features/dashboard/create-appliance-form";
import { Copy } from "lucide-react";
import { removeAppliance } from "@/lib/api/devices";
import { useAuth } from "@/components/providers/auth-provider";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type RangeKey = "24h" | "7d" | "30d";

const RANGE_MAP: Record<RangeKey, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

function getRange(rangeKey: RangeKey) {
  const to = Date.now();
  const from = to - RANGE_MAP[rangeKey];
  return { from: new Date(from).toISOString(), to: new Date(to).toISOString() };
}

export function DeviceCommandCenter({
  device,
  appliances,
}: {
  device: Device;
  appliances: Appliance[];
}) {
  const [applianceList, setApplianceList] =
    useState<Appliance[]>(appliances);
  const [selectedAppliance, setSelectedAppliance] = useState<string | null>(
    appliances[0]?.label ?? null,
  );
  const [deleteState, setDeleteState] = useState<{
    label: string | null;
    error: string | null;
    pending: boolean;
  }>({ label: null, error: null, pending: false });
  const [confirmLabel, setConfirmLabel] = useState<string | null>(null);
  const [rangeKey, setRangeKey] = useState<RangeKey>("24h");
  const range = useMemo(() => getRange(rangeKey), [rangeKey]);
  const { lastError } = useSocket();
  const { apiClient } = useAuth();
  const {
    metrics,
    liveData,
    deviceHealth,
    lastHeartbeat,
    anomalies,
    maintenanceStatus,
    setActiveChannel,
    dismissAnomaly,
    resetMaintenance,
  } = useTelemetry();

  useEffect(() => {
    if (!selectedAppliance) {
      setActiveChannel(null);
      return;
    }
    setActiveChannel({
      deviceId: device.id,
      appliance: selectedAppliance,
      range,
    });
  }, [device.id, range, selectedAppliance, setActiveChannel]);

  const status = deviceHealth[device.id] ?? "idle";
  const lastSeen = lastHeartbeat[device.id];
  const latestMetric = metrics[metrics.length - 1];
  const powerSummary = liveData?.deviceId === device.id &&
    liveData?.appliance === selectedAppliance
      ? liveData.power
      : latestMetric?.power;

  const deviceAnomalies = anomalies.filter(
    (alert) => alert.deviceId === device.id,
  );

  const activeMaintenance = maintenanceStatus.find(
    (entry) =>
      entry.deviceId === device.id && entry.appliance === selectedAppliance,
  );

  const handleDeleteAppliance = async (label: string) => {
    setConfirmLabel(label);
  };

  const confirmDeleteAppliance = async () => {
    if (!confirmLabel) return;
    setDeleteState({ label: confirmLabel, error: null, pending: true });
    try {
      await removeAppliance(apiClient, device.id, confirmLabel);
      setApplianceList((prev) =>
        prev.filter((item) => item.label !== confirmLabel),
      );
      setSelectedAppliance((prev) =>
        prev === confirmLabel ? null : prev,
      );
      setDeleteState({ label: null, error: null, pending: false });
      setConfirmLabel(null);
    } catch {
      setDeleteState({
        label: confirmLabel,
        error: "Unable to delete this appliance right now.",
        pending: false,
      });
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmModal
        open={Boolean(confirmLabel)}
        title="Delete appliance?"
        description={
          confirmLabel
            ? `This will permanently remove ${confirmLabel}.`
            : undefined
        }
        confirmLabel="Delete"
        onConfirm={confirmDeleteAppliance}
        onCancel={() => setConfirmLabel(null)}
        loading={deleteState.pending}
      />
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: device.label },
        ]}
      />

      <Card title="Device Command Center" description={device.mac_address}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-50">
              {device.label}
              <p className="flex gap-2 items-center text-sm text-[var(--color-muted-foreground)]">
                <span>ID: {device.id}</span>
                <Copy 
                  onClick={() => {
                    navigator.clipboard.writeText(device.id);
                  }}
                  className="ml-2 inline-block cursor-pointer text-[var(--color-muted-foreground)]"
                  size={16}
                />
              </p>
              <p>
                <span className="text-sm text-[var(--color-muted-foreground)]">
                  {device.description ?? "No description provided."}
                </span>
              </p>
            </h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Power summary and real-time health.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={status} />
          </div>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DeviceHealthIndicator status={status} lastSeen={lastSeen} />
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Power
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-50">
                  {powerSummary ? powerSummary.toFixed(2) : "N/A"} W
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Active appliance
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-50">
                  {selectedAppliance ?? "None"}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Anomalies
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-50">
                  {deviceAnomalies.length}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                Timeline range
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
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
            <GhostModeToggle deviceId={device.id} is_muted={device.is_muted} />
          </div>
        </div>
      </Card>

      {status === "offline" ? (
        <Alert variant="warning">
          Device Offline Mode: controls are disabled until telemetry resumes.
        </Alert>
      ) : null}
      {lastError && lastError.toLowerCase().includes("unauthorized") ? (
        <Alert variant="error">
          Device Unauthorized: verify you own this device or refresh your access
          token.
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card
          title="Appliances"
          description="Select an appliance for deep telemetry"
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {deleteState.error ? (
              <Alert variant="error">{deleteState.error}</Alert>
            ) : null}
            {applianceList.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">
                No appliances connected yet.
              </p>
            ) : (
              applianceList.map((appliance) => (
                <ApplianceCard
                  key={appliance.id}
                  deviceId={device.id}
                  appliance={appliance}
                  isSelected={selectedAppliance === appliance.label}
                  onSelect={() => setSelectedAppliance(appliance.label)}
                  onDelete={handleDeleteAppliance}
                  deleting={
                    deleteState.pending && deleteState.label === appliance.label
                  }
                />
              ))
            )}
          </div>
        </Card>
        <div className="space-y-4">
          <KillSwitchToggle
            deviceId={device.id}
            appliance={selectedAppliance}
          />
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

      <Card
        title="Add Appliance"
        description="Create appliances for this device"
      >
        <CreateApplianceForm
          deviceId={device.id}
          onCreated={(appliance) => {
            setApplianceList((prev) => [...prev, appliance]);
            setSelectedAppliance(appliance.label);
          }}
        />
      </Card>

      {deviceAnomalies.length ? (
        <Card title="Anomaly Alerts" description="Latest warnings">
          <div className="space-y-3">
            {deviceAnomalies.map((alert) => (
              <AnomalyCard
                key={alert.id}
                anomaly={alert}
                onDismiss={dismissAnomaly}
              />
            ))}
          </div>
        </Card>
      ) : null}

      <TokenRotationCard deviceId={device.id} />
    </div>
  );
}
