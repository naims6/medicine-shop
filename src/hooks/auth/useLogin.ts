"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import type { LoginPayload } from "@/types";

/**
 * Login mutation. The backend sets httpOnly cookies on success; we seed the
 * session cache with the returned user so /auth/me isn't refetched immediately.
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
    },
  });
}
