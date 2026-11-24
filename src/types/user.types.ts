/** Matches the `role` values the backend returns (UserResponseDto). */
export type UserRole = "Admin" | "Salesman";

/** Matches the `status` values the backend returns (UserResponseDto). */
export type UserStatus = "Active" | "Inactive";

/**
 * Mirrors SafeUser / UserResponseDto from the NestJS backend.
 * Password and refreshTokenHash are never returned by the API.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone: string | null;
  isDeleted: boolean;
  createdAt: string; // ISO-8601 string from JSON
  updatedAt: string; // ISO-8601 string from JSON
}

/** Payload sent to POST /users */
export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status?: UserStatus;
  phone?: string;
}

/** Payload sent to PATCH /users/:id */
export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
}

/** Payload sent to PATCH /users/:id/password */
export interface ChangePasswordPayload {
  newPassword: string;
}
