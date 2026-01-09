"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { generateDeviceToken } from "@/lib/api/auth";

interface DeviceTokenCardProps {
  deviceId: string | null;
  deviceLabel?: string | null;
}

export function DeviceTokenCard({
  deviceId,
  deviceLabel,
}: DeviceTokenCardProps) {
  const { apiClient } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      if (!deviceId) {
        return Promise.reject(new Error("Select a device first"));
      }
      return generateDeviceToken(apiClient, deviceId);
    },
    onSuccess: (payload) => {
      setError(null);
      setToken(payload.token);
      setCopied(false);
    },
    onError: (err) => {
      setToken(null);
      if (isAxiosError(err)) {
        setError(
          (err.response?.data as { message?: string })?.message ??
            "Unable to generate a device token.",
        );
      } else {
        setError("Unable to generate a device token right now.");
      }
    },
  });

  const copyToken = async () => {
    // Tokens are single-view; allow quick copy for provisioning hardware.
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
  };

  return (
    <Card
      title="Device token"
      description="Tokens are shown once. Regenerate if needed."
    >
      <div className="space-y-4">
        {error ? <Alert variant="error">{error}</Alert> : null}
        {!deviceId ? (
          <Alert variant="info">
            Select a device to generate a provisioning token.
          </Alert>
        ) : null}
        {token ? (
          <div className="space-y-2 rounded-xl border border-emerald-300/30 bg-emerald-500/5 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-200/80">
              Token for {deviceLabel ?? "device"}
            </p>
            <p className="break-all font-mono text-sm text-emerald-100">
              {token}
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={copyToken}
              disabled={copied}
            >
              {copied ? "Copied" : "Copy token"}
            </Button>
          </div>
        ) : null}
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !deviceId}
        >
          {mutation.isPending ? "Generating..." : "Generate token"}
        </Button>
      </div>
    </Card>
  );
}
