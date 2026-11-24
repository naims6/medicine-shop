"use client";

import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";

export function useSession({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authService.getMe(),
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
