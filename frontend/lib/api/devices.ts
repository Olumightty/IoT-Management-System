import type { AxiosInstance } from "axios";
import type { Appliance, Device } from "@/lib/types/device";

export interface PairDevicePayload {
  mac_address: string;
  label: string;
}

export interface CreateAppliancePayload {
  rated_power: number;
  label: string;
}

export async function getDevices(
  client: AxiosInstance,
): Promise<Device[]> {
  const response = await client.get<{ data: Device[] }>("/devices");
  return response.data.data;
}

export async function pairDevice(
  client: AxiosInstance,
  payload: PairDevicePayload,
): Promise<Device> {
  const response = await client.post<{ data: Device }>(
    "/devices/pair",
    payload,
  );
  return response.data.data;
}

export async function removeDevice(
  client: AxiosInstance,
  id: string,
): Promise<{ message: string }> {
  const response = await client.delete<{ message: string }>(`/devices/${id}`);
  return response.data;
}

export async function getAppliances(
  client: AxiosInstance,
  deviceId: string,
): Promise<Appliance[]> {
  const response = await client.get<{ data: Appliance[] }>(
    `/devices/${deviceId}/appliances`,
  );
  return response.data.data;
}

export async function createAppliance(
  client: AxiosInstance,
  deviceId: string,
  payload: CreateAppliancePayload,
): Promise<Appliance> {
  const response = await client.post<{ data: Appliance }>(
    `/devices/${deviceId}/appliances`,
    payload,
  );
  return response.data.data;
}

export async function removeAppliance(
  client: AxiosInstance,
  deviceId: string,
  slug: string,
): Promise<{ message: string }> {
  const response = await client.delete<{ message: string }>(
    `/devices/${deviceId}/appliances/${slug}`,
  );
  return response.data;
}
