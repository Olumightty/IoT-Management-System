import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends PropsWithChildren {
  className?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function Card({
  className,
  children,
  title,
  description,
  action,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/90 p-6 shadow-xl shadow-slate-950/50 backdrop-blur",
        className,
      )}
    >
      {(title || description || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title ? (
              <h3 className="text-lg font-semibold text-slate-50">{title}</h3>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                {description}
              </p>
            ) : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
