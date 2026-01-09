import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/features/dashboard/dashboard-shell";
import DashboardLoading from "./loading";
import { getServerSession } from "@/lib/server/session";
import { getServerAppliances, getServerDevices } from "@/lib/server/devices";
import type { Appliance } from "@/lib/types/device";

async function DashboardContent() {
  // Server-side gate keeps protected content and fetches initial device/appliance lists for Suspense hydration.
  const session = await getServerSession();
  if (!session) {
    redirect("/login?reason=unauthorized");
  }

  const devices = (await getServerDevices(session.accessToken)) ?? [];
  let appliances: Appliance[] = [];

  if (devices[0]) {
    appliances =
      (await getServerAppliances(devices[0].id, session.accessToken)) ?? [];
  }

  return (
    <DashboardShell
      profile={session.profile}
      devices={devices}
      appliances={appliances}
    />
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
