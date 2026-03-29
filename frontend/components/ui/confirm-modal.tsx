"use client";

import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  variant?: "danger" | "primary";
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  variant = "danger",
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--color-card)]/95 p-6 shadow-2xl shadow-slate-950/60">
        <h3 className="text-lg font-semibold text-slate-50">{title}</h3>
        {description ? (
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            {description}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            size="sm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Working..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
