"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/components/providers/auth-provider";
import { generateDeviceToken } from "@/lib/api/auth";

interface TokenRotationCardProps {
  deviceId: string | null;
}

export function TokenRotationCard({ deviceId }: TokenRotationCardProps) {
  const { apiClient } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const rotationMutation = useMutation({
    mutationFn: () => {
      if (!deviceId) {
        return Promise.reject(new Error("Select a device first"));
      }
      return generateDeviceToken(apiClient, deviceId);
    },
    onSuccess: (response) => {
      setToken(response.token);
    },
    onError: () => {
      setToken(null);
    },
  });

  const handleCopy = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopyStatus("Copied");
      setTimeout(() => setCopyStatus(null), 2000);
    } catch {
      setCopyStatus("Copy failed");
    }
  };

  return (
    <Card
      title="Token Rotation"
      description="Regenerate device credentials (shown once)"
      className="border-rose-500/40"
    >
      <div className="space-y-4">
        <p className="text-xs text-rose-200/70">
          Rotating the token invalidates the previous credential immediately.
        </p>
        {rotationMutation.isError ? (
          <Alert variant="error">
            {isAxiosError(rotationMutation.error)
              ? (rotationMutation.error.response?.data as { message?: string })
                  ?.message ?? "Unable to rotate token."
              : "Unable to rotate token."}
          </Alert>
        ) : null}
        {token ? (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3">
            <p className="text-xs uppercase tracking-wide text-rose-200/70">
              New Token
            </p>
            <p className="mt-2 break-all text-sm font-semibold text-rose-100">
              {token}
            </p>
            <Button className="mt-3" variant="secondary" size="sm" onClick={handleCopy}>
              {copyStatus ?? "Copy Token"}
            </Button>
          </div>
        ) : null}
        <Button
          variant="primary"
          onClick={() => rotationMutation.mutate()}
          disabled={!deviceId || rotationMutation.isPending}
        >
          {rotationMutation.isPending ? "Generating..." : "Generate New Token"}
        </Button>
      </div>
    </Card>
  );
}
