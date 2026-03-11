import { Card } from "@/components/ui/card";

export default function FrontendDocsPage() {
  return (
    <section className="space-y-4">
      <Card title="Frontend Features" description="What users can do in the UI">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-slate-50">Authentication</p>
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              Sign up, log in, and persist sessions with refresh tokens.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-slate-50">Dashboard</p>
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              Overview of connected devices, live status, and recent telemetry.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-slate-50">Device Pairing</p>
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              Register devices with name, description, and MAC address.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-slate-50">
              Appliance Mapping
            </p>
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              Add multiple appliances under a single device for granular control.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-slate-50">Telemetry Charts</p>
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              Interactive charts with brush timelines, multi-axis overlays, and
              range toggles.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-slate-50">AI Insight Reports</p>
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              7-day summaries with warnings, recommendations, and health scores.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-slate-50">Anomaly Alerts</p>
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              Auto-detected power spikes with dismissal controls.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-slate-50">Control Panel</p>
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              Send ON/OFF commands to appliances from the device view.
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}
