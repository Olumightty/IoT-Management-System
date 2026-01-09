import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/lib/env";

interface ClientOptions {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
  onLogout: () => void;
}

export function createApiClient({
  getAccessToken,
  refreshAccessToken,
  onLogout,
}: ClientOptions): AxiosInstance {
  // Base axios instance with auth header injection and 401 auto-refresh handling.
  const client = axios.create({
    baseURL: API_URL,
    withCredentials: true,
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;
      const isAuthRoute =
        typeof error.config?.url === "string" &&
        error.config.url.includes("/auth/refresh");

      if (status === 401 && !isAuthRoute && !error.config?.__isRetryRequest) {
        try {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            error.config.__isRetryRequest = true;
            error.config.headers.Authorization = `Bearer ${refreshed}`;
            return client.request(error.config);
          }
        } catch {
          // fall through to logout
        }
        onLogout();
      }

      return Promise.reject(error);
    },
  );

  return client;
}
