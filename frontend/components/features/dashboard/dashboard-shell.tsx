"use client";

import { useEffect, useMemo, useState } from "react";
import type { UserProfile } from "@/lib/types/auth";
import type { Appliance, Device } from "@/lib/types/device";
import { getAppliances } from "@/lib/api/devices";
import { useAuth } from "@/components/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { DevicePanel } from "./device-panel";
import { PairDeviceForm } from "./pair-device-form";
import { AppliancePanel } from "./appliance-panel";
import { CreateApplianceForm } from "./create-appliance-form";
import { DeviceCard } from "@/components/features/command-center/device-card";
import { TokenRotationCard } from "@/components/features/command-center/token-rotation-card";

interface DashboardShellProps {
  profile: UserProfile;
  devices: Device[];
  appliances: Appliance[];
}

type LoadState = "idle" | "loading" | "ready" | "error";

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "Something went wrong.";
}

export function DashboardShell({
  profile,
  devices: initialDevices,
  appliances: initialAppliances,
}: DashboardShellProps) {
  // Coordinates client-side state for device/appliance selection, mutations, and live telemetry panels.
  const { apiClient } = useAuth();
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(
    initialDevices[0]?.id ?? null,
  );
  const [appliances, setAppliances] =
    useState<Appliance[]>(initialAppliances);
  const [selectedAppliance, setSelectedAppliance] = useState<string | null>(
    initialAppliances[0]?.label ?? null,
  );
  const [applianceLoadState, setApplianceLoadState] =
    useState<LoadState>("idle");
  const [applianceError, setApplianceError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDeviceId) {
      setAppliances([]);
      setSelectedAppliance(null);
      return;
    }

    let cancelled = false;
    // Load appliances whenever the selected device changes; guard against updates after unmount.
    setApplianceLoadState("loading");
    setApplianceError(null);
    getAppliances(apiClient, selectedDeviceId)
      .then((items) => {
        if (cancelled) return;
        setAppliances(items);
        setSelectedAppliance(items[0]?.label ?? null);
        setApplianceLoadState("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setApplianceError(getErrorMessage(err));
        setApplianceLoadState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [apiClient, selectedDeviceId]);

  const handleDeviceCreated = (device: Device) => {
    setDevices((prev) => [...prev, device]);
    setSelectedDeviceId(device.id);
  };

  const handleDeviceRemoved = (deviceId: string) => {
    setDevices((prev) => {
      const nextDevices = prev.filter((device) => device.id !== deviceId);
      if (selectedDeviceId === deviceId) {
        const nextDevice = nextDevices[0];
        setSelectedDeviceId(nextDevice?.id ?? null);
        setAppliances([]);
        setSelectedAppliance(null);
      }
      return nextDevices;
    });
  };

  const handleApplianceCreated = (appliance: Appliance) => {
    setAppliances((prev) => [...prev, appliance]);
    setSelectedAppliance(appliance.label);
  };

  const handleApplianceRemoved = (label: string) => {
    setAppliances((prev) => {
      const nextList = prev.filter((item) => item.label !== label);
      if (selectedAppliance === label) {
        setSelectedAppliance(nextList[0]?.label ?? null);
      }
      return nextList;
    });
  };

  const totalAppliances = useMemo(
    () => appliances.length,
    [appliances.length],
  );

  const groupedDevices = useMemo(() => {
    const groups: Record<string, Device[]> = {
      Kitchen: [],
      Office: [],
      "Living Room": [],
      General: [],
    };
    devices.forEach((device) => {
      const label = device.label.toLowerCase();
      if (label.includes("kitchen")) {
        groups.Kitchen.push(device);
      } else if (label.includes("office")) {
        groups.Office.push(device);
      } else if (label.includes("living")) {
        groups["Living Room"].push(device);
      } else {
        groups.General.push(device);
      }
    });
    return groups;
  }, [devices]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card title="Account" description="Profile overview">
          <p className="text-lg font-semibold text-slate-50">
            {profile.first_name} {profile.last_name}
          </p>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {profile.email}
          </p>
          <p className="mt-2 text-xs uppercase tracking-wide text-emerald-200/80">
            {profile.role}
          </p>
        </Card>
        <Card title="Devices" description="Paired to your account">
          <p className="text-3xl font-semibold text-slate-50">
            {devices.length}
          </p>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Linked gateway{devices.length === 1 ? "" : "s"}
          </p>
        </Card>
        <Card title="Appliances" description="Attached to selected device">
          <p className="text-3xl font-semibold text-slate-50">
            {totalAppliances}
          </p>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Monitoring appliance{totalAppliances === 1 ? "" : "s"}
          </p>
        </Card>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedDevices).map(([group, items]) =>
          items.length ? (
            <div key={group}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-50">{group}</h2>
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  {items.length} device{items.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((device) => (
                  <DeviceCard key={device.id} device={device} />
                ))}
              </div>
            </div>
          ) : null,
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DevicePanel
          devices={devices}
          selectedDeviceId={selectedDeviceId}
          onSelectDevice={setSelectedDeviceId}
          onDeviceRemoved={handleDeviceRemoved}
        />
        <Card
          title="Pair a device"
          description="MAC address and label are required"
        >
          <PairDeviceForm onDeviceCreated={handleDeviceCreated} />
        </Card>
      </div>

      {/* <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AppliancePanel
          deviceId={selectedDeviceId}
          appliances={appliances}
          selectedAppliance={selectedAppliance}
          onSelectAppliance={setSelectedAppliance}
          onApplianceRemoved={handleApplianceRemoved}
          loading={applianceLoadState === "loading"}
          error={applianceError}
        />
        <Card
          title="Add an appliance"
          description="Attach appliances to the selected device"
        >
          <CreateApplianceForm
            deviceId={selectedDeviceId}
            onCreated={handleApplianceCreated}
          />
          {!selectedDeviceId ? (
            <Alert variant="info" className="mt-4">
              Pair a device before creating appliances.
            </Alert>
          ) : null}
        </Card>
      </div>

      <TokenRotationCard deviceId={selectedDeviceId} /> */}
    </div>
  );
}
