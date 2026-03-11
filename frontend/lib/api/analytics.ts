import type { AxiosInstance } from "axios";
import type { InsightReport, InsightsResponse } from "@/lib/types/analytics";

export async function getInsights(
  client: AxiosInstance,
  deviceId: string,
  appliance: string,
): Promise<InsightReport | null> {
  const response = await client.get<InsightsResponse>(
    `/analytics/insights/${deviceId}/${encodeURIComponent(appliance)}`,
  );

  if (!response.data?.status) {
    return null;
  }

  return response.data.report ?? null;
}
