import type { PropsWithChildren, ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface AuthShellProps extends PropsWithChildren {
  title: string;
  subtitle: string;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, footer, children }: AuthShellProps) {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center">
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs uppercase tracking-[0.35em] text-emerald-200/80">
          IoT Management
        </p>
        <h1 className="text-3xl font-semibold text-slate-50">{title}</h1>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          {subtitle}
        </p>
      </div>
      <Card className="w-full max-w-xl border-white/10">
        <div className="space-y-8">{children}</div>
        {footer ? <div className="mt-8 text-sm text-slate-200">{footer}</div> : null}
      </Card>
    </div>
  );
}
