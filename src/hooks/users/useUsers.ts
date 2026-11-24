"use client";

import { useQuery } from "@tanstack/react-query";
import { usersService, type UsersQuery } from "@/services/users.service";

export function useUsers(query: UsersQuery = {}) {
  return useQuery({
    queryKey: ["users", query],
    queryFn: () => usersService.getAll(query),
    placeholderData: (prev) => prev, // keep stale data while refetching pages
    staleTime: 30 * 1000,
  });
}
