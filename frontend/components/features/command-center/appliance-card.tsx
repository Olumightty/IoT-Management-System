"use client";

import Link from "next/link";
import type { Appliance } from "@/lib/types/device";
import { useTelemetry } from "@/components/providers/telemetry-provider";

interface ApplianceCardProps {
  deviceId: string;
  appliance: Appliance;
  isSelected: boolean;
  onSelect: () => void;
}

export function ApplianceCard({
  deviceId,
  appliance,
  isSelected,
  onSelect,
}: ApplianceCardProps) {
  const { liveData } = useTelemetry();
  const isActive =
    liveData?.deviceId === deviceId && liveData?.appliance === appliance.label;

  return (
    <div
      className={`group rounded-2xl border bg-white/5 p-4 transition ${
        isSelected ? "border-emerald-400/60" : "border-white/10"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-50">{appliance.label}</p>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Rated {appliance.rated_power} W
          </p>
          {appliance.monthly_usage !== undefined ? (
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Goal {appliance.monthly_usage.toFixed(1)} kWh/mo
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSelect}
            className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-slate-100 hover:border-emerald-300/60"
          >
            Select
          </button>
          <Link
            href={`/devices/${deviceId}/${appliance.label}`}
            className="text-xs uppercase tracking-wide text-emerald-200/70"
          >
            View
          </Link>
        </div>
      </div>
      <div className="mt-3 text-xs text-[var(--color-muted-foreground)]">
        {isActive ? `Live power ${liveData?.power.toFixed(2)} W` : "No live telemetry yet"}
      </div>
    </div>
  );
}
