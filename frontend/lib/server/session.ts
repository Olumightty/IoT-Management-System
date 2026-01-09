import { cookies } from "next/headers";
import { cache } from "react";
import { API_URL } from "@/lib/env";
import type { UserProfile } from "@/lib/types/auth";

export interface Session {
  accessToken: string;
  profile: UserProfile;
}

// Refreshes access token via HttpOnly refresh cookie, then loads the profile on the server.
export const getServerSession = cache(async (): Promise<Session | null> => {
  try {
    const cookieStore = await cookies();
    const refreshCookie = cookieStore.get("refreshToken");

    if (!refreshCookie) {
      return null;
    }

    const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        cookie: cookieStore.toString(),
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!refreshResponse.ok) {
      return null;
    }

    const refreshData = (await refreshResponse.json()) as {
      accessToken?: string;
    };

    if (!refreshData?.accessToken) {
      return null;
    }

    const profileResponse = await fetch(`${API_URL}/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${refreshData.accessToken}`,
      },
      cache: "no-store",
    });

    if (!profileResponse.ok) {
      return null;
    }

    const profilePayload = (await profileResponse.json()) as {
      data?: UserProfile;
      message?: string;
    };

    if (!profilePayload.data) {
      return null;
    }

    return {
      accessToken: refreshData.accessToken,
      profile: profilePayload.data,
    };
  } catch {
    return null;
  }
});
