"use client";

import type { DeviceHealthStatus } from "@/lib/types/analytics";

interface DeviceHealthIndicatorProps {
  status: DeviceHealthStatus;
  lastSeen?: string;
}

const STATUS_COLOR: Record<DeviceHealthStatus, string> = {
  healthy: "bg-emerald-400",
  idle: "bg-slate-400",
  offline: "bg-rose-500",
};

const STATUS_LABEL: Record<DeviceHealthStatus, string> = {
  healthy: "Healthy heartbeat",
  idle: "Recently active",
  offline: "Offline",
};

export function DeviceHealthIndicator({
  status,
  lastSeen,
}: DeviceHealthIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`h-3 w-3 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.6)] ${STATUS_COLOR[status]}`}
      />
      <div>
        <p className="text-sm font-semibold text-slate-50">
          {STATUS_LABEL[status]}
        </p>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          {lastSeen ? `Last heartbeat ${new Date(lastSeen).toLocaleString()}` : "Waiting for telemetry"}
        </p>
      </div>
    </div>
  );
}
