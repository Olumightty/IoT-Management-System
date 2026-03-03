"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";
import { useTelemetry } from "@/components/providers/telemetry-provider";
import { sendCommand } from "@/lib/api/control";

interface KillSwitchToggleProps {
  deviceId: string | null;
  appliance: string | null;
}

export function KillSwitchToggle({ deviceId, appliance }: KillSwitchToggleProps) {
  const { apiClient } = useAuth();
  const { liveData } = useTelemetry();
  const [currentLimit, setCurrentLimit] = useState<string>("15");
  const [isArmed, setIsArmed] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasTriggered, setHasTriggered] = useState(false);

  const limitValue = useMemo(() => Number(currentLimit), [currentLimit]);

  const killMutation = useMutation({
    mutationFn: () => {
      if (!deviceId || !appliance) {
        return Promise.reject(new Error("Select a device and appliance first"));
      }
      return sendCommand(apiClient, { deviceId, appliance, command: "OFF" });
    },
    onSuccess: () => {
      setStatus("Emergency Shutdown Triggered");
      setError(null);
      setHasTriggered(true);
    },
    onError: (err) => {
      setStatus(null);
      if (isAxiosError(err)) {
        setError(
          (err.response?.data as { message?: string })?.message ??
            "Unable to trigger shutdown.",
        );
      } else {
        setError("Unable to trigger shutdown.");
      }
    },
  });

  useEffect(() => {
    if (!isArmed || !liveData || !deviceId || !appliance) return;
    if (hasTriggered) return;
    if (liveData.deviceId !== deviceId || liveData.appliance !== appliance) {
      return;
    }
    if (Number.isFinite(limitValue) && liveData.current > limitValue) {
      killMutation.mutate();
    }
  }, [
    appliance,
    deviceId,
    hasTriggered,
    isArmed,
    killMutation,
    limitValue,
    liveData,
  ]);

  const disabled = !deviceId || !appliance || killMutation.isPending;

  return (
    <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-rose-100">Safety Kill Switch</p>
          <p className="text-xs text-rose-200/70">
            Auto-shutdown when live current exceeds the limit.
          </p>
        </div>
        <Button
          variant={isArmed ? "secondary" : "primary"}
          size="sm"
          onClick={() => {
            setIsArmed((prev) => !prev);
            setHasTriggered(false);
          }}
          disabled={disabled}
        >
          {isArmed ? "Disarm" : "Arm"}
        </Button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Input
          value={currentLimit}
          onChange={(event) => setCurrentLimit(event.target.value)}
          type="number"
          min="1"
          step="0.1"
          placeholder="Current limit (A)"
        />
        <span className="text-xs text-rose-200/70">A</span>
      </div>

      {status ? <Alert className="mt-3" variant="success">{status}</Alert> : null}
      {error ? <Alert className="mt-3" variant="error">{error}</Alert> : null}
    </div>
  );
}
