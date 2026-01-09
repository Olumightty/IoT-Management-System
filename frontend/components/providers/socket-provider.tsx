"use client";

import type { PropsWithChildren } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";
import { API_URL } from "@/lib/env";
import { useAuth } from "./auth-provider";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  lastError: string | null;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export function SocketProvider({ children }: PropsWithChildren) {
  const { accessToken, refreshAccessToken, logout } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const refreshingRef = useRef(false);

  useEffect(() => {
    if (!accessToken) {
      if (socket) {
        socket.disconnect();
      }
      setSocket(null);
      setIsConnected(false);
      return;
    }

    // Establish a websocket connection only after auth is present.
    const instance = io(API_URL, {
      auth: { token: accessToken },
      transports: ["websocket"],
      reconnectionAttempts: 3, // Prevent infinite reconnect loops
      upgrade: false,
    });

    instance.on("connect", () => {
      setIsConnected(true);
      setLastError(null);
    });

    instance.on("connect_error", async (error: Error) => {
      setIsConnected(false);
      setLastError(error.message);

      // If the token is invalid/expired, try a single refresh then reconnect with the new token.
      const tokenError =
        error.message?.toLowerCase().includes("invalid") ||
        error.message?.toLowerCase().includes("expired") ||
        error.message?.toLowerCase().includes("missing");

      if (tokenError && !refreshingRef.current) {
        refreshingRef.current = true;
        const refreshed = await refreshAccessToken();
        refreshingRef.current = false;

        if (refreshed) {
          instance.auth = { token: refreshed };
          instance.connect();
          return;
        }

        // If refresh fails, log out and stop further reconnect attempts.
        instance.removeAllListeners();
        instance.disconnect();
        await logout();
      }
    });

    instance.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(instance);

    return () => {
      instance.disconnect();
      setIsConnected(false);
    };
  }, [accessToken]);

  const value = useMemo(
    () => ({
      socket,
      isConnected,
      lastError,
    }),
    [isConnected, lastError, socket],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
