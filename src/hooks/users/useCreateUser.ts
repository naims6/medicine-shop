"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import type { CreateUserPayload } from "@/types";

export function useCreateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      usersService.createUser(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
