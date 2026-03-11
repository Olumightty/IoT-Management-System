import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";

export default function TelemetryDocsPage() {
  return (
    <>
      <section className="space-y-4">
        <Card title="Telemetry Flow" description="What happens after publish">
          <div className="space-y-3 text-sm text-slate-100">
            <p>
              Each telemetry message is routed into time-series storage. The
              frontend command center listens for live updates and renders
              streaming charts alongside historical windows (24h, 7d, 30d).
            </p>
            <p className="text-[var(--color-muted-foreground)]">
              Ensure every payload includes `power`, `voltage`, `temperature`,
              and `current` so the analytics and AI insight modules can compute
              summaries, health scores, and warnings.
            </p>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <Card title="Control Commands" description="Remote appliance control">
          <div className="space-y-3 text-sm text-slate-100">
            <p>
              The SaaS control panel publishes command messages to each
              appliance. Your microcontroller should parse the incoming JSON
              and apply the `ON` or `OFF` state to the appliance relay.
            </p>
            <Alert variant="warning">
              Always validate that the `pattern` topic matches the target
              appliance label before actuating hardware.
            </Alert>
          </div>
        </Card>
      </section>
    </>
  );
}
