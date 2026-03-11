import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function DocsPage() {
  return (
    <>
      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
            Getting Started
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-50">
            Connect your microcontroller to the SaaS platform
          </h2>
          <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
            This guide shows how a device owner signs up, pairs hardware, and
            streams telemetry into the dashboard in minutes.
          </p>
        </div>

        <Alert variant="info">
          Devices authenticate with `deviceId` as the MQTT username and a
          generated secure token as the password. Telemetry is sent over MQTT
          using QoS 0 on port 1883 with TLS enabled.
        </Alert>
      </section>

      <section className="space-y-4">
        <Card title="Quick Start" description="End-to-end onboarding workflow">
          <ol className="list-decimal space-y-3 pl-5 text-sm text-slate-100">
            <li>
              Sign up and visit the documentation page to copy your MQTT broker
              URL.
            </li>
            <li>
              Pair a device in the SaaS using a friendly name, description, and
              the device MAC address.
            </li>
            <li>
              Create one or more appliances under that device, then copy the
              generated `deviceId` and create a secure token.
            </li>
            <li>
              Configure the microcontroller to authenticate to MQTT using
              `deviceId` as the username and the secure token as the password.
            </li>
            <li>
              Publish telemetry and subscribe to command topics to enable remote
              control.
            </li>
          </ol>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="accent">QoS 0</Badge>
            <Badge variant="muted">Port 1883</Badge>
            <Badge variant="warning">TLS Required</Badge>
          </div>
        </Card>
      </section>
    </>
  );
}
