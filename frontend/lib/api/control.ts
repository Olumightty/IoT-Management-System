import type { AxiosInstance } from "axios";
import type { ControlCommand } from "@/lib/types/control";

export async function sendCommand(
  client: AxiosInstance,
  payload: ControlCommand,
): Promise<{ message: string }> {
  const response = await client.post<{ message: string }>("/control", payload);
  return response.data;
}
