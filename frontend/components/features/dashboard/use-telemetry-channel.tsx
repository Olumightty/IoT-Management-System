"use client";

import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import type { LiveTelemetry, MetricsPoint } from "@/lib/types/analytics";

type TelemetryStatus = "idle" | "loading" | "ready" | "error";

interface TelemetryChannelOptions {
  socket: Socket | null;
  deviceId: string | null;
  appliance: string | null;
  from: string;
  to: string;
}

function isMetricsPoint(candidate: unknown): candidate is MetricsPoint {
  if (!candidate || typeof candidate !== "object") {
    return false;
  }
  const typed = candidate as Record<string, unknown>;
  return (
    typeof typed._time === "string" &&
    typeof typed.voltage === "number" &&
    typeof typed.current === "number" &&
    typeof typed.power === "number"
  );
}

function isLiveTelemetry(
  candidate: unknown,
): candidate is LiveTelemetry {
  if (!candidate || typeof candidate !== "object") {
    return false;
  }
  const typed = candidate as Record<string, unknown>;
  return (
    typeof typed.voltage === "number" &&
    typeof typed.current === "number" &&
    typeof typed.power === "number"
  );
}

export function useTelemetryChannel({
  socket,
  deviceId,
  appliance,
  from,
  to,
}: TelemetryChannelOptions) {
  const [metrics, setMetrics] = useState<MetricsPoint[]>([]);
  const [liveReading, setLiveReading] = useState<LiveTelemetry | null>(null);
  const [status, setStatus] = useState<TelemetryStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !deviceId || !appliance) {
      setStatus("idle");
      setMetrics([]);
      setLiveReading(null);
      setError(
        deviceId && appliance
          ? "Socket not connected yet."
          : "Select a device and appliance to load telemetry.",
      );
      return;
    }

    // Join the requested appliance channel, pull historical metrics, and stream live telemetry.
    setStatus("loading");
    setError(null);

    const handleMetrics = (payload: unknown) => {
      const parsed = payload as {
        status?: boolean;
        message?: string;
        data?: unknown[];
      };

      if (parsed.status === false) {
        setError(parsed.message ?? "Unable to load metrics.");
        setStatus("error");
        return;
      }

      const nextMetrics =
        parsed.data?.filter(isMetricsPoint) as MetricsPoint[] | undefined;

      setMetrics(nextMetrics ?? []);
      setStatus("ready");
    };

    const handleLive = (payload: unknown) => {
      if (isLiveTelemetry(payload)) {
        setLiveReading(payload);
      }
    };

    socket.emit("query_metrics", {
      deviceId,
      appliance,
      from,
      to,
    });

    socket.on("metrics_response", handleMetrics);
    socket.on("liveTelemetry", handleLive);

    return () => {
      socket.off("metrics_response", handleMetrics);
      socket.off("liveTelemetry", handleLive);
    };
  }, [appliance, deviceId, from, socket, to]);

  return { metrics, liveReading, status, error };
}
