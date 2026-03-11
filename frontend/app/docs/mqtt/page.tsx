import { Card } from "@/components/ui/card";
import { CodeBlock } from "@/components/features/docs/code-block";

const telemetryPayload = `{
  "power": 120.5,
  "voltage": 228.0,
  "temperature": 36.2,
  "current": 0.53
}`;

const controlPayload = `{
  "pattern": "cmnd/device_id/appliance_label/state",
  "data": {
    "state": "ON"
  }
}`;

export default function MqttDocsPage() {
  return (
    <>
      <section className="space-y-4">
        <Card title="MQTT Credentials" description="How devices authenticate">
          <div className="space-y-3 text-sm text-slate-100">
            <p>
              After pairing a device and creating appliances, open the device
              page to generate a secure token. Store the token on the
              microcontroller and use it only for MQTT authentication.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Username
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-50">
                  deviceId
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Password
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-50">
                  Secure token
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Broker
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-50">
                  SaaS MQTT URL
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Transport
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-50">
                  TLS on port 1883
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <Card title="MQTT Topics" description="Publish telemetry and listen for commands">
          <div className="space-y-5 text-sm text-slate-100">
            <div>
              <p className="font-semibold text-slate-50">Telemetry Publish Topic</p>
              <p className="mt-1 text-[var(--color-muted-foreground)]">
                `energy/device_id/appliance_label/telemetry`
              </p>
              <CodeBlock
                title="Telemetry Payload"
                language="json"
                code={telemetryPayload}
                className="mt-3"
              />
            </div>
            <div>
              <p className="font-semibold text-slate-50">Control Subscribe Topic</p>
              <p className="mt-1 text-[var(--color-muted-foreground)]">
                `cmnd/device_id/+/state`
              </p>
              <CodeBlock
                title="Control Payload"
                language="json"
                code={controlPayload}
                className="mt-3"
              />
            </div>
          </div>
        </Card>
      </section>
    </>
  );
}
