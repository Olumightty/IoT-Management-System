import type { PropsWithChildren } from "react";
import { DocsSidebar } from "@/components/features/docs/docs-sidebar";

export default function DocsLayout({ children }: PropsWithChildren) {
  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-white/5 px-6 py-6 shadow-lg shadow-slate-950/50">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">
          Documentation
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-50">
          SaaS Device Onboarding Guide
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Industry-grade setup instructions, MQTT topics, and platform features.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <DocsSidebar />
        <div className="space-y-8">{children}</div>
      </div>
    </div>
  );
}
