import { API_URL } from "@/lib/env";
import type { Appliance, Device } from "@/lib/types/device";

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T;
  return payload;
}

export async function getServerDevices(
  accessToken: string,
): Promise<Device[] | null> {
  // Server-side fetch of devices with bearer token to keep pages a server component.
  const response = await fetch(`${API_URL}/devices`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = await parseJson<{ data?: Device[] }>(response);
  return payload.data ?? null;
}

export async function getServerAppliances(
  deviceId: string,
  accessToken: string,
): Promise<Appliance[] | null> {
  // Fetches appliances for a device on the server to prehydrate dashboard.
  const response = await fetch(`${API_URL}/devices/${deviceId}/appliances`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = await parseJson<{ data?: Appliance[] }>(response);
  return payload.data ?? null;
}
