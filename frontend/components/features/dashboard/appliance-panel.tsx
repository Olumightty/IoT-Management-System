"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { removeAppliance } from "@/lib/api/devices";
import type { Appliance } from "@/lib/types/device";

interface AppliancePanelProps {
  deviceId: string | null;
  appliances: Appliance[];
  selectedAppliance: string | null;
  onSelectAppliance: (label: string) => void;
  onApplianceRemoved: (label: string) => void;
  loading: boolean;
  error?: string | null;
}

export function AppliancePanel({
  deviceId,
  appliances,
  selectedAppliance,
  onSelectAppliance,
  onApplianceRemoved,
  loading,
  error,
}: AppliancePanelProps) {
  const { apiClient } = useAuth();
  const [actionError, setActionError] = useState<string | null>(null);

  const removeMutation = useMutation({
    // Removes an appliance from the selected device via the API and syncs UI state.
    mutationFn: (label: string) => {
      if (!deviceId) {
        return Promise.reject(new Error("Select a device first"));
      }
      return removeAppliance(apiClient, deviceId, label);
    },
    onSuccess: (_, label) => {
      onApplianceRemoved(label);
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        setActionError(
          (err.response?.data as { message?: string })?.message ??
            "Unable to remove this appliance.",
        );
      } else {
        setActionError("Unable to remove this appliance right now.");
      }
    },
  });

  return (
    <Card
      title="Appliances"
      description={
        deviceId
          ? `${appliances.length} attached appliance${appliances.length === 1 ? "" : "s"}`
          : "Select a device to view appliances"
      }
      className="h-full"
    >
      <div className="space-y-3">
        {error ? <Alert variant="error">{error}</Alert> : null}
        {actionError ? <Alert variant="error">{actionError}</Alert> : null}
        {loading ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Loading appliances...
          </p>
        ) : null}
        {!loading && appliances.length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            No appliances found for this device.
          </p>
        ) : null}
        {!loading && appliances.length > 0 ? (
          <ul className="space-y-3">
            {appliances.map((appliance) => {
              const isActive = appliance.label === selectedAppliance;
              return (
                <li
                  key={appliance.id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3"
                >
                  <button
                    type="button"
                    onClick={() => onSelectAppliance(appliance.label)}
                    className="flex flex-1 items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-50">
                        {appliance.label}
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">
                        {appliance.rated_power} W ·{" "}
                        {new Date(appliance.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={isActive ? "accent" : "muted"}>
                      {isActive ? "Monitoring" : "Idle"}
                    </Badge>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-3"
                    onClick={() => removeMutation.mutate(appliance.label)}
                    disabled={removeMutation.isPending}
                  >
                    {removeMutation.isPending ? "Removing..." : "Remove"}
                  </Button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </Card>
  );
}
