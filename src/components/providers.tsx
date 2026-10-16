"use client";
import { useState, type ReactNode } from "react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { meKey } from "@/features/auth/session";
import { ApiError } from "@/lib/api";

// Client errors (4xx) won't succeed on a retry; network and server errors get one more try.
const shouldRetry = (failures: number, error: unknown) =>
  failures < 1 &&
  !(error instanceof ApiError && error.status >= 400 && error.status < 500);

export function Providers({ children }: { children: ReactNode }) {
  // One client per browser session; created in state so it survives re-renders.
  const [client] = useState(() => {
    // A request refused because the session ended (or a password change is due) refreshes the
    // signed-in user, and the app shell then sends them to the right screen.
    const onError = (error: unknown) => {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.code === "PASSWORD_CHANGE_REQUIRED")
      )
        void client.invalidateQueries({ queryKey: meKey });
    };
    const client: QueryClient = new QueryClient({
      queryCache: new QueryCache({ onError }),
      mutationCache: new MutationCache({ onError }),
      defaultOptions: {
        queries: {
          // Data is shared across pages; refetch it in the background after 30 seconds.
          staleTime: 30_000,
          retry: shouldRetry,
        },
      },
    });
    return client;
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
