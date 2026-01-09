"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { removeDevice } from "@/lib/api/devices";
import type { Device } from "@/lib/types/device";

interface DevicePanelProps {
  devices: Device[];
  selectedDeviceId: string | null;
  onSelectDevice: (id: string) => void;
  onDeviceRemoved: (id: string) => void;
}

export function DevicePanel({
  devices,
  selectedDeviceId,
  onSelectDevice,
  onDeviceRemoved,
}: DevicePanelProps) {
  const { apiClient } = useAuth();
  const [actionError, setActionError] = useState<string | null>(null);

  const removeMutation = useMutation({
    // Delegate deletion to the backend and prune local state on success.
    mutationFn: (deviceId: string) => removeDevice(apiClient, deviceId),
    onSuccess: (_, deviceId) => {
      onDeviceRemoved(deviceId);
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        setActionError(
          (error.response?.data as { message?: string })?.message ??
            "Unable to remove this device.",
        );
      } else {
        setActionError("Unable to remove this device right now.");
      }
    },
  });

  const deviceCountCopy = useMemo(
    () => `${devices.length} linked device${devices.length === 1 ? "" : "s"}`,
    [devices.length],
  );

  return (
    <Card
      title="Devices"
      description={deviceCountCopy}
      className="h-full"
    >
      <div className="space-y-3">
        {actionError ? <Alert variant="error">{actionError}</Alert> : null}
        {devices.length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            No paired devices yet. Add a device to start monitoring appliances.
          </p>
        ) : (
          <ul className="space-y-3">
            {devices.map((device) => {
              const isActive = device.id === selectedDeviceId;
              return (
                <li
                  key={device.id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3"
                >
                  <button
                    type="button"
                    onClick={() => onSelectDevice(device.id)}
                    className="flex flex-1 items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-50">
                        {device.label}
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">
                        {device.mac_address}
                      </p>
                    </div>
                    <Badge variant={isActive ? "accent" : "muted"}>
                      {isActive ? "Active" : "Available"}
                    </Badge>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-3"
                    onClick={() => removeMutation.mutate(device.id)}
                    disabled={removeMutation.isPending}
                  >
                    {removeMutation.isPending ? "Removing..." : "Remove"}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
