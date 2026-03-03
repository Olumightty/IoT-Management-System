"use client";

import { Button } from "@/components/ui/button";
import type { MaintenanceStatus } from "@/lib/types/analytics";

interface MaintenanceCardProps {
  status: MaintenanceStatus;
  onReset: (deviceId: string, appliance: string) => void;
}

export function MaintenanceCard({ status, onReset }: MaintenanceCardProps) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        status.due
          ? "border-amber-400/50 bg-amber-500/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-50">
            Maintenance {status.due ? "Due" : "Tracker"}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Runtime {status.runtimeHours.toFixed(1)} hrs
          </p>
          {status.lastReset ? (
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              Last reset {new Date(status.lastReset).toLocaleString()}
            </p>
          ) : null}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onReset(status.deviceId, status.appliance)}
        >
          Reset
        </Button>
      </div>
      {status.due ? (
        <p className="mt-3 text-xs text-amber-100">
          Maintenance required. Review filters or bearings.
        </p>
      ) : null}
    </div>
  );
}
