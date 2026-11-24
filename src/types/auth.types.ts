/** Backend user role enum (src/common/types/role.enum.ts). */
export type AuthRole = "Admin" | "Salesman";

/** Backend user status enum (src/common/types/user-status.enum.ts). */
export type AuthStatus = "Active" | "Inactive";

/** Authenticated user as returned by the backend (UserResponseDto). */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  status: AuthStatus;
  phone: string | null;
  isDeleted: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/** Credentials for POST /auth/login. */
export interface LoginPayload {
  email: string;
  password: string;
}
