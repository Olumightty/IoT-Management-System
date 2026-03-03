import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/server/session";
import { getServerAppliances, getServerDevices } from "@/lib/server/devices";
import { DeviceCommandCenter } from "@/components/features/command-center/device-command-center";

interface DevicePageProps {
  params: Promise<{ id: string }>;
}

export default async function DevicePage({ params }: DevicePageProps) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login?reason=unauthorized");
  }

  const { id } = await params;
  const devices = (await getServerDevices(session.accessToken)) ?? [];
  const device = devices.find((item) => item.id === id);

  if (!device) {
    notFound();
  }

  const appliances =
    (await getServerAppliances(device.id, session.accessToken)) ?? [];

  return <DeviceCommandCenter device={device} appliances={appliances} />;
}
