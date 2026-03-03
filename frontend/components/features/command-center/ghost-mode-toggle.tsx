"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/components/providers/auth-provider";
import { updateDevice } from "@/lib/api/devices";

interface GhostModeToggleProps {
  deviceId: string | null;
  is_muted: boolean;
}

export function GhostModeToggle({ deviceId, is_muted }: GhostModeToggleProps) {
  const { apiClient } = useAuth();
  const [isMuted, setIsMuted] = useState(is_muted ?? false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ghostMutation = useMutation({
    mutationFn: (nextMuted: boolean) => {
      if (!deviceId) {
        return Promise.reject(new Error("Select a device first"));
      }
      return updateDevice(apiClient, deviceId, { is_muted: nextMuted });
    },
    onSuccess: (_, nextMuted) => {
      setIsMuted(nextMuted);
      setStatus(nextMuted ? "Ghost mode enabled" : "Ghost mode disabled");
      setError(null);
    },
    onError: (err) => {
      setStatus(null);
      if (isAxiosError(err)) {
        setError(
          (err.response?.data as { message?: string })?.message ??
            "Unable to update ghost mode.",
        );
      } else {
        setError("Unable to update ghost mode.");
      }
    },
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-50">Ghost Mode</p>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Pause telemetry writes and hide live data streams.
          </p>
        </div>
        <Button
          variant={isMuted ? "secondary" : "primary"}
          size="sm"
          onClick={() => ghostMutation.mutate(!isMuted)}
          disabled={!deviceId || ghostMutation.isPending}
        >
          {isMuted ? "Disable" : "Enable"}
        </Button>
      </div>
      {status ? <Alert className="mt-3" variant="success">{status}</Alert> : null}
      {error ? <Alert className="mt-3" variant="error">{error}</Alert> : null}
    </div>
  );
}
