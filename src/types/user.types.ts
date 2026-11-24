export type UserRole = "Salesman" | "Admin" | "cashier" | "admin";

export type UserStatus = "Active" | "Inactive";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  password?: string;
  phone?: string;
  isDeleted?: boolean;
  createdAt?: string;
}
