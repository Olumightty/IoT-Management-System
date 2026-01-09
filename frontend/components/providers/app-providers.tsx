"use client";

import type { PropsWithChildren } from "react";
import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { AuthProvider } from "./auth-provider";
import { SocketProvider } from "./socket-provider";
import type { SessionState } from "@/lib/types/session";

interface AppProvidersProps extends PropsWithChildren {
  session?: SessionState | null;
}

export function AppProviders({ children, session }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    // React Query + Auth + Socket contexts wrapped for the entire client tree.
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        initialAccessToken={session?.accessToken}
        initialProfile={session?.profile}
      >
        <SocketProvider>{children}</SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
