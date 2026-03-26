"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TroubleshootingDocsPage() {
  return (
    <section className="space-y-4">
      <Card title="Troubleshooting" description="Common setup issues">
        <div className="space-y-3 text-sm text-slate-100">
          <p>
            If telemetry does not appear, verify the MQTT credentials and topic
            format exactly. The `appliance_label` segment must match the
            appliance label created in the SaaS.
          </p>
          <p className="text-[var(--color-muted-foreground)]">
            For TLS issues, re-check the root CA certificate and confirm the
            device clock is accurate before establishing a secure connection.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Back to top
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
