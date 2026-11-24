"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";

interface AdminOnlyProps {
  children: React.ReactNode;
  /**
   * Where to send non-Admin users. Defaults to /dashboard/pos so Salesmen land
   * directly at the POS terminal, the only place they're meant to work.
   */
  redirectTo?: string;
}

/**
 * Wraps any page that is restricted to the Admin role.
 *
 * Behaviour:
 * - While session is loading  → shows a full-page spinner (avoids content flash).
 * - Authenticated non-Admin   → redirects to `redirectTo` (default /dashboard/pos).
 * - Unauthenticated           → AppLayout already handles the /login redirect;
 *                               we just show the spinner until that effect fires.
 * - Authenticated Admin       → renders children normally.
 */
export function AdminOnly({
  children,
  redirectTo = "/dashboard/pos",
}: AdminOnlyProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && !isAdmin) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, isAdmin, redirectTo, router]);

  // Show spinner while the session query is in-flight or while the redirect
  // navigation is pending (authenticated but wrong role).
  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <LoadingSpinner size="w-6 h-6" centered />
      </div>
    );
  }

  return <>{children}</>;
}
