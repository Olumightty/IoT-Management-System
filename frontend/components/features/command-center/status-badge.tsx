"use client";

import { Badge } from "@/components/ui/badge";
import type { DeviceHealthStatus } from "@/lib/types/analytics";

interface StatusBadgeProps {
  status: DeviceHealthStatus;
}

const STATUS_COPY: Record<DeviceHealthStatus, string> = {
  healthy: "Online",
  idle: "Idle",
  offline: "Offline",
};

const STATUS_VARIANT: Record<DeviceHealthStatus, "accent" | "muted" | "warning"> =
  {
    healthy: "accent",
    idle: "muted",
    offline: "warning",
  };

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_COPY[status]}</Badge>;
}
