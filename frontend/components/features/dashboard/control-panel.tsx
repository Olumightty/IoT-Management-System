"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { sendCommand } from "@/lib/api/control";
import type { Command } from "@/lib/types/control";

interface ControlPanelProps {
  deviceId: string | null;
  appliance: string | null;
}

export function ControlPanel({ deviceId, appliance }: ControlPanelProps) {
  const { apiClient } = useAuth();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const commandMutation = useMutation({
    mutationFn: (command: Command) => {
      if (!deviceId || !appliance) {
        return Promise.reject(new Error("Select a device and appliance first"));
      }
      return sendCommand(apiClient, { deviceId, appliance, command });
    },
    onSuccess: (response) => {
      setStatusMessage(response.message);
      setErrorMessage(null);
    },
    onError: (error) => {
      setStatusMessage(null);
      if (isAxiosError(error)) {
        setErrorMessage(
          (error.response?.data as { message?: string })?.message ??
            "Unable to send command.",
        );
      } else {
        setErrorMessage("Unable to send command right now.");
      }
    },
  });

  const isDisabled = useMemo(
    () => !deviceId || !appliance || commandMutation.isPending,
    [appliance, commandMutation.isPending, deviceId],
  );

  return (
    <Card
      title="Control"
      description="Send ON/OFF commands to the selected appliance"
    >
      <div className="space-y-4">
        {!deviceId || !appliance ? (
          <Alert variant="info">
            Choose a device and appliance to start sending commands.
          </Alert>
        ) : null}
        {/* Status copies surface command responses and failures for quick troubleshooting */}
        {statusMessage ? (
          <Alert variant="success">{statusMessage}</Alert>
        ) : null}
        {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            onClick={() => commandMutation.mutate("ON")}
            disabled={isDisabled}
          >
            {commandMutation.isPending ? "Sending..." : "Turn ON"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => commandMutation.mutate("OFF")}
            disabled={isDisabled}
          >
            {commandMutation.isPending ? "Sending..." : "Turn OFF"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
