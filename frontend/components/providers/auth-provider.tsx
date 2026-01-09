"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AxiosInstance } from "axios";
import type { PropsWithChildren } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createApiClient } from "@/lib/api/client";
import { fetchProfile, logout as logoutApi, refresh } from "@/lib/api/auth";
import type { UserProfile } from "@/lib/types/auth";

interface AuthContextValue {
  accessToken: string | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  apiClient: AxiosInstance;
  setSession: (token: string, profile: UserProfile) => void;
  refreshAccessToken: () => Promise<string | null>;
  logout: () => Promise<void>;
  setProfile: (profile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps extends PropsWithChildren {
  initialAccessToken?: string;
  initialProfile?: UserProfile;
}

export function AuthProvider({
  children,
  initialAccessToken,
  initialProfile,
}: AuthProviderProps) {
  // Holds the authoritative client-side auth state that powers the API client.
  const [accessToken, setAccessToken] = useState<string | null>(
    initialAccessToken ?? null,
  );
  const [profile, setProfile] = useState<UserProfile | null>(
    initialProfile ?? null,
  );
  const queryClient = useQueryClient();
  const apiRef = useRef<AxiosInstance | null>(null);

  const setSession = useCallback(
    (token: string, nextProfile: UserProfile) => {
      setAccessToken(token);
      setProfile(nextProfile);
      queryClient.invalidateQueries();
    },
    [queryClient],
  );

  const handleLogout = useCallback(async () => {
    if (apiRef.current) {
      try {
        await logoutApi(apiRef.current);
      } catch {
        // ignore logout errors so the client can still clear state
      }
    }
    setAccessToken(null);
    setProfile(null);
    queryClient.clear();
  }, [queryClient]);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (!apiRef.current) {
      return null;
    }
    const refreshed = await refresh(apiRef.current);
    if (refreshed?.accessToken) {
      setAccessToken(refreshed.accessToken);
      if (!profile) {
        // If we don't have a profile yet, fetch it now.
        const nextProfile = await fetchProfile(apiRef.current, refreshed.accessToken);
        setProfile(nextProfile);
      }
      return refreshed.accessToken;
    }
    return null;
  }, [profile]);

  const apiClient =
    apiRef.current ??
    createApiClient({
      getAccessToken: () => accessToken,
      refreshAccessToken,
      onLogout: handleLogout,
    });

  apiRef.current = apiClient;

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      profile,
      isAuthenticated: Boolean(accessToken && profile),
      apiClient,
      setSession,
      refreshAccessToken,
      logout: handleLogout,
      setProfile: (nextProfile: UserProfile) => setProfile(nextProfile),
    }),
    [accessToken, apiClient, handleLogout, profile, refreshAccessToken, setSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
