"use client";

import { useEffect } from "react";
import { useAuth } from "./auth-provider";
import type { SessionState } from "@/lib/types/session";

interface SessionHydratorProps {
  session: SessionState;
}

export function SessionHydrator({ session }: SessionHydratorProps) {
  // Syncs the server-rendered session into the client AuthProvider when the protected layout mounts.
  const { accessToken, profile, setSession } = useAuth();

  useEffect(() => {
    if (!session) {
      return;
    }
    const isSameSession =
      accessToken === session.accessToken &&
      profile?.id === session.profile.id;

    if (!isSameSession) {
      setSession(session.accessToken, session.profile);
    }
  }, [accessToken, profile?.id, session, setSession]);

  return null;
}
