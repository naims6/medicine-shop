"use client";

import React, { createContext, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/auth/useSession";
import { useLogin } from "@/hooks/auth/useLogin";
import { useLogout } from "@/hooks/auth/useLogout";
import { onSessionExpired } from "@/lib/apiClient";
import type { AuthUser, LoginPayload } from "@/types";

/** Routes where we must NOT call /auth/me (no session exists yet). */
const PUBLIC_ROUTES = ["/login"];

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Session provider. Composes the TanStack Query auth hooks and exposes the same
 * `useAuth()` shape the UI already consumes, so call sites barely change.
 *
 * Auth is cookie-based (httpOnly), so session state comes from the /auth/me
 * query — no localStorage. When the apiClient detects a dead session (refresh
 * failed) it calls the registered handler, which clears the cache; the
 * AppLayout guard then redirects to /login.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  const session = useSession({ enabled: !isPublicRoute });
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  // Wire the apiClient's "session is dead" signal to a cache clear.
  useEffect(() => {
    onSessionExpired(() => {
      queryClient.clear();
    });
  }, [queryClient]);

  const user = session.data ?? null;
  // "loading" only on the very first fetch (no data yet and no error yet).
  const isLoading = session.isLoading && !session.isError;

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: (payload: LoginPayload) => loginMutation.mutateAsync(payload),
    logout: () => logoutMutation.mutateAsync(),
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
