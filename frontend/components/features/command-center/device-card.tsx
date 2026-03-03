"use client";

import Link from "next/link";
import type { Device } from "@/lib/types/device";
import { useTelemetry } from "@/components/providers/telemetry-provider";
import { StatusBadge } from "./status-badge";

interface DeviceCardProps {
  device: Device;
}

export function DeviceCard({ device }: DeviceCardProps) {
  const { deviceHealth, lastHeartbeat, anomalies, liveData } = useTelemetry();
  const status = deviceHealth[device.id] ?? "idle";
  const lastSeen = lastHeartbeat[device.id];
  const anomalyCount = anomalies.filter((item) => item.deviceId === device.id)
    .length;
  const powerSummary =
    liveData?.deviceId === device.id ? liveData.power.toFixed(2) : null;

  return (
    <Link
      href={`/devices/${device.id}`}
      className="group block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-emerald-400/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-50">
            {device.label}
          </p>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {device.mac_address}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="mt-4 space-y-2 text-sm text-[var(--color-muted-foreground)]">
        <p>
          Power summary: {powerSummary ? `${powerSummary} W` : "Awaiting telemetry"}
        </p>
        <p>Last active: {lastSeen ? new Date(lastSeen).toLocaleString() : "No telemetry yet"}</p>
        <p>Anomalies: {anomalyCount}</p>
      </div>
      <div className="mt-4 text-xs uppercase tracking-wide text-emerald-200/70">
        Open Command Center
      </div>
    </Link>
  );
}
