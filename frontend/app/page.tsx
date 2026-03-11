import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="space-y-12">
      <header className="rounded-3xl border border-white/10 bg-white/5 px-6 py-8 shadow-lg shadow-slate-950/50">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">
          IoT Management Console
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-50">
          Connect, monitor, and control your devices in real time
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[var(--color-muted-foreground)]">
          Stream telemetry over MQTT, track appliance health, and issue remote
          commands from a unified command center.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild variant="primary">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/register">Create account</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/docs">Read the Docs</Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card title="MQTT Onboarding" description="Secure device pairing">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Generate device tokens, authenticate via TLS, and stream telemetry
            using structured MQTT topics.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="accent">QoS 0</Badge>
            <Badge variant="muted">Port 1883</Badge>
            <Badge variant="warning">TLS Required</Badge>
          </div>
        </Card>
        <Card title="Command Center" description="Operate appliances">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Visualize real-time telemetry, issue ON/OFF commands, and review AI
            insight summaries in one place.
          </p>
        </Card>
        <Card title="AI Insights" description="Predictive operations">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Get warnings, recommendations, and health scores generated from your
            last 7 days of telemetry.
          </p>
        </Card>
      </section>
    </div>
  );
}
