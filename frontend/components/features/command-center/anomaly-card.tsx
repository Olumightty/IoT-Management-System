"use client";

import { Button } from "@/components/ui/button";
import type { AnomalyAlert } from "@/lib/types/analytics";

interface AnomalyCardProps {
  anomaly: AnomalyAlert;
  onDismiss: (id: string) => void;
}

export function AnomalyCard({ anomaly, onDismiss }: AnomalyCardProps) {
  return (
    <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-rose-100">Anomaly Alert</p>
          <p className="mt-1 text-sm text-rose-100/80">{anomaly.message}</p>
          <p className="mt-2 text-xs text-rose-200/70">
            {new Date(anomaly.timestamp).toLocaleString()}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDismiss(anomaly.id)}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}
