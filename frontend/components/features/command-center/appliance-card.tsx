"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { Appliance } from "@/lib/types/device";
import { useTelemetry } from "@/components/providers/telemetry-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { sendCommand } from "@/lib/api/control";

interface ApplianceCardProps {
  deviceId: string;
  appliance: Appliance;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: (label: string) => void;
  deleting?: boolean;
}

export function ApplianceCard({
  deviceId,
  appliance,
  isSelected,
  onSelect,
  onDelete,
  deleting = false,
}: ApplianceCardProps) {
  const { liveData } = useTelemetry();
  const { apiClient } = useAuth();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const commandMutation = useMutation({
    mutationFn: (command: "ON" | "OFF") =>
      sendCommand(apiClient, { deviceId, appliance: appliance.label, command }),
    onSuccess: (response) => {
      setStatusMessage(response.message);
      setErrorMessage(null);
    },
    onError: () => {
      setStatusMessage(null);
      setErrorMessage("Unable to send command right now.");
    },
  });

  const isActive =
    liveData?.deviceId === deviceId && liveData?.appliance === appliance.label;

  return (
    <div
      className={`group rounded-2xl border bg-white/5 p-4 transition ${isSelected ? "border-emerald-400/60" : "border-white/10"}`}
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
          <Button
            type="button"
            size="sm"
            variant={isSelected ? "primary" : "secondary"}
            onClick={onSelect}
          >
            {isSelected ? "Selected" : "Select"}
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href={`/devices/${deviceId}/${appliance.label}`}>
              <Eye size={14} />
            </Link>
          </Button>
          {onDelete ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onDelete(appliance.label)}
              disabled={deleting}
            >
              <Trash2 size={14} />
            </Button>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="primary"
          onClick={() => commandMutation.mutate("ON")}
          disabled={commandMutation.isPending}
        >
          {commandMutation.isPending ? "Sending..." : "Turn ON"}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => commandMutation.mutate("OFF")}
          disabled={commandMutation.isPending}
        >
          {commandMutation.isPending ? "Sending..." : "Turn OFF"}
        </Button>
      </div>
      {/* <div className="mt-3 text-xs text-[var(--color-muted-foreground)]">
        {isActive ? `Live power ${liveData?.power.toFixed(2)} W` : "No live telemetry yet"}
      </div> */}
      {statusMessage ? (
        <p className="mt-1 text-xs text-emerald-200">{statusMessage}</p>
      ) : null}
      {errorMessage ? (
        <p className="mt-1 text-xs text-rose-200">{errorMessage}</p>
      ) : null}
    </div>
  );
}