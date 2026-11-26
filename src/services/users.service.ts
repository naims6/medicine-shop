import { api } from "@/lib/apiClient";
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  ChangePasswordPayload,
  PaginationMeta,
} from "@/types";

export interface UsersPage {
  data: User[];
  meta: PaginationMeta;
}

export interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export const usersService = {
  /** GET /users?page=&limit=&search=&role=&status= */
  getAll(query: UsersQuery = {}): Promise<UsersPage> {
    const params = new URLSearchParams();
    if (query.page !== undefined) params.set("page", String(query.page));
    if (query.limit !== undefined) params.set("limit", String(query.limit));
    if (query.search) params.set("search", query.search);
    if (query.role && query.role !== "ALL") params.set("role", query.role);
    if (query.status && query.status !== "ALL") params.set("status", query.status);
    const qs = params.toString();
    return api.getPaginated<UsersPage>(`/users${qs ? `?${qs}` : ""}`);
  },

  /** POST /users */
  createUser(payload: CreateUserPayload): Promise<User> {
    return api.post<User>("/users", payload);
  },

  /** PATCH /users/:id */
  updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
    return api.patch<User>(`/users/${id}`, payload);
  },

  /** PATCH /users/:id/password */
  changePassword(id: string, payload: ChangePasswordPayload): Promise<{ success: boolean; message: string }> {
    return api.patch<{ success: boolean; message: string }>(`/users/${id}/password`, payload);
  },

  /** DELETE /users/:id */
  deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(`/users/${id}`);
  },
};
