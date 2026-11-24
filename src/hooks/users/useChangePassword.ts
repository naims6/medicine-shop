"use client";

import { useMutation } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import type { ChangePasswordPayload } from "@/types";

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ChangePasswordPayload;
    }) => usersService.changePassword(id, payload),
  });
}
