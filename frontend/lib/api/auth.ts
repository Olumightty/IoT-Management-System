import type { AxiosInstance } from "axios";
import type { AuthResponse, RefreshResponse, UserProfile } from "@/lib/types/auth";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  first_name: string;
  last_name: string;
}

export async function login(
  client: AxiosInstance,
  payload: LoginPayload,
): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>("/auth/login", payload);
  return response.data;
}

export async function register(
  client: AxiosInstance,
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>("/auth/register", payload);
  return response.data;
}

export async function refresh(
  client: AxiosInstance,
): Promise<RefreshResponse | null> {
  try {
    const response = await client.post<RefreshResponse>("/auth/refresh");
    return response.data;
  } catch {
    return null;
  }
}

export async function logout(
  client: AxiosInstance,
): Promise<{ message: string }> {
  const response = await client.post<{ message: string }>("/auth/logout");
  return response.data;
}

export async function fetchProfile(
  client: AxiosInstance, accessToken: string
): Promise<UserProfile> {
  const response = await client.get<{ data: UserProfile }>("/auth/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data.data;
}

export async function generateDeviceToken(
  client: AxiosInstance,
  deviceId: string,
): Promise<{ token: string; message: string }> {
  const response = await client.post<{ token: string; message: string }>(
    "/auth/generate-device-token",
    { deviceId },
  );
  return response.data;
}
