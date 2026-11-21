import { User, UserRole, UserStatus } from "@/types";
import { initialUsers } from "@/data/mockUsers";

const STORAGE_KEY = "shodesh_users_v2";

export interface CreateUserInput {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
}

function getStoredUsers(): User[] {
  if (typeof window === "undefined") {
    return initialUsers;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsers));
      return initialUsers;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsers));
      return initialUsers;
    }

    return parsed.map((u: Partial<User>) => ({
      id: u.id || `usr-${Date.now()}`,
      name: u.name || "User",
      email: u.email || "",
      role: (u.role === "admin" || u.role === "Admin") ? "Admin" : "Salesman",
      status: u.status === "Inactive" ? "Inactive" : "Active",
      password: u.password || "password123",
      phone: u.phone || "",
      createdAt: u.createdAt || new Date().toISOString(),
    })) as User[];
  } catch (err) {
    console.error("Failed to load users from localStorage:", err);
    return initialUsers;
  }
}

function saveStoredUsers(users: User[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("Failed to save users to localStorage:", err);
  }
}

export const userRepository = {
  async getAllUsers(): Promise<User[]> {
    return getStoredUsers();
  },

  async getUserById(id: string): Promise<User | null> {
    const users = getStoredUsers();
    return users.find((u) => u.id === id) || null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const users = getStoredUsers();
    const cleanEmail = email.trim().toLowerCase();
    return users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  async createUser(data: CreateUserInput): Promise<User> {
    const users = getStoredUsers();
    const cleanEmail = data.email.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error(`A user with email "${data.email}" already exists.`);
    }

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      email: cleanEmail,
      password: data.password?.trim() || "password123",
      role: data.role === "Admin" || (data.role as string) === "admin" ? "Admin" : "Salesman",
      status: data.status || "Active",
      phone: data.phone?.trim() || "",
      createdAt: new Date().toISOString(),
    };

    const updated = [newUser, ...users];
    saveStoredUsers(updated);
    return newUser;
  },

  async updateUser(id: string, updates: UpdateUserInput): Promise<User> {
    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error(`User with ID ${id} not found.`);
    }

    if (updates.email) {
      const cleanEmail = updates.email.trim().toLowerCase();
      const existing = users.find(
        (u) => u.id !== id && u.email.toLowerCase() === cleanEmail
      );
      if (existing) {
        throw new Error(`Email "${updates.email}" is already used by another account.`);
      }
    }

    const current = users[index];
    const updatedUser: User = {
      ...current,
      ...(updates.name !== undefined && { name: updates.name.trim() }),
      ...(updates.email !== undefined && { email: updates.email.trim().toLowerCase() }),
      ...(updates.role !== undefined && {
        role: updates.role === "Admin" || (updates.role as string) === "admin" ? "Admin" : "Salesman",
      }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.phone !== undefined && { phone: updates.phone.trim() }),
      ...(updates.password !== undefined && updates.password.trim() !== "" && {
        password: updates.password.trim(),
      }),
    };

    users[index] = updatedUser;
    saveStoredUsers(users);
    return updatedUser;
  },

  async toggleUserStatus(id: string): Promise<User> {
    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error(`User with ID ${id} not found.`);
    }

    const current = users[index];
    const newStatus: UserStatus = current.status === "Active" ? "Inactive" : "Active";
    const updatedUser: User = {
      ...current,
      status: newStatus,
    };

    users[index] = updatedUser;
    saveStoredUsers(users);
    return updatedUser;
  },

  async deleteUser(id: string): Promise<void> {
    const users = getStoredUsers();
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length === users.length) {
      throw new Error(`User with ID ${id} not found.`);
    }
    saveStoredUsers(filtered);
  },

  async resetToDefault(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsers));
    }
  },
};
