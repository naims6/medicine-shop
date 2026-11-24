"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";

/**
 * Logout mutation. The backend clears httpOnly cookies; we drop the entire
 * query cache so the next login starts with no stale user / business data.
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
