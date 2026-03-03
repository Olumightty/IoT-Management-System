import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/server/session";
import { getServerAppliances, getServerDevices } from "@/lib/server/devices";
import { ApplianceDetail } from "@/components/features/command-center/appliance-detail";

interface AppliancePageProps {
  params: Promise<{ id: string; appliance_label: string }>;
}

export default async function AppliancePage({ params }: AppliancePageProps) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login?reason=unauthorized");
  }

  const { id, appliance_label } = await params;
  const devices = (await getServerDevices(session.accessToken)) ?? [];
  const device = devices.find((item) => item.id === id);
  if (!device) {
    notFound();
  }

  const appliances =
    (await getServerAppliances(device.id, session.accessToken)) ?? [];
  const appliance = appliances.find(
    (item) => item.label === appliance_label,
  );

  if (!appliance) {
    notFound();
  }

  return <ApplianceDetail device={device} appliance={appliance} />;
}
