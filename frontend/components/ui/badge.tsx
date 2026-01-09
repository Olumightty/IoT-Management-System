import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends PropsWithChildren {
  variant?: "accent" | "muted" | "warning";
  className?: string;
}

export function Badge({
  children,
  variant = "accent",
  className,
}: BadgeProps) {
  const variants: Record<BadgeProps["variant"], string> = {
    accent: "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-300/30",
    muted: "bg-white/5 text-slate-200 ring-1 ring-white/10",
    warning: "bg-amber-500/15 text-amber-200 ring-1 ring-amber-300/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
