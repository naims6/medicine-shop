import { api } from "@/lib/apiClient";
import type { AuthUser, LoginPayload } from "@/types";


interface MeResponse {
  user: AuthUser;
}

interface LoginResponse {
  user: AuthUser;
  /** Returned in the body but unused — auth is cookie-based. */
  accessToken: string;
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

export const authService = {
  /** GET /auth/me — the current authenticated user. */
  getMe(): Promise<AuthUser> {
    return api.get<MeResponse>("/auth/me").then((r) => r.user);
  },

  /** POST /auth/login — validates credentials; backend sets httpOnly cookies. */
  login(payload: LoginPayload): Promise<AuthUser> {
    return api
      .post<LoginResponse>("/auth/login", payload)
      .then((r) => r.user);
  },

  /** POST /auth/logout — clears httpOnly cookies server-side. */
  logout(): Promise<void> {
    return api.post<LogoutResponse>("/auth/logout").then(() => undefined);
  },
};
