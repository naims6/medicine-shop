import { api } from "@/lib/apiClient";
import type { AuthUser, LoginPayload } from "@/types";

interface MeResponse {
  user: AuthUser;
}

interface LoginResponse {
  user: AuthUser;
}

export const authService = {
  /** GET /auth/me */
  getMe(): Promise<AuthUser> {
    return api.get<MeResponse>("/auth/me").then((r) => r.user);
  },

  /** POST /auth/login */
  login(payload: LoginPayload): Promise<AuthUser> {
    return api.post<LoginResponse>("/auth/login", payload).then((r) => r.user);
  },

  /** POST /auth/logout */
  logout(): Promise<void> {
    return api.post<{ success: boolean }>("/auth/logout").then(() => undefined);
  },
};
