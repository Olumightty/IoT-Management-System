import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "error" | "success" | "info" | "warning";

interface AlertProps extends PropsWithChildren {
  variant?: AlertVariant;
  title?: string;
  className?: string;
}

const styles: Record<AlertVariant, string> = {
  error:
    "bg-rose-500/10 text-rose-100 ring-1 ring-inset ring-rose-400/50",
  success:
    "bg-emerald-500/10 text-emerald-100 ring-1 ring-inset ring-emerald-400/50",
  info: "bg-sky-500/10 text-sky-100 ring-1 ring-inset ring-sky-400/50",
  warning:
    "bg-amber-500/10 text-amber-100 ring-1 ring-inset ring-amber-400/50",
};

export function Alert({
  variant = "info",
  title,
  children,
  className,
}: AlertProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl px-4 py-3 text-sm",
        styles[variant],
        className,
      )}
    >
      <div className="space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className="text-sm leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}
