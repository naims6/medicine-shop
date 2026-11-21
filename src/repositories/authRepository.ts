import { User } from "@/types";
import { userRepository } from "@/repositories/userRepository";
import { demoAccounts } from "@/data/mockUsers";

const AUTH_STORAGE_KEY = "pharmacare_auth_session_v1";

export interface IAuthRepository {
  login(credentials: { email: string; password: string }): Promise<User>;
  getCurrentUser(): User | null;
  logout(): Promise<void>;
}

export const authRepository: IAuthRepository = {
  async login({ email, password }: { email: string; password: string }): Promise<User> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Check userRepository first
    const allUsers = await userRepository.getAllUsers();
    let user = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    // Fallback to demoAccounts if not found in repository
    if (!user) {
      const demoMatch = demoAccounts.find((d) => d.user.email.toLowerCase() === cleanEmail);
      if (demoMatch) {
        user = demoMatch.user;
      }
    }

    if (!user) {
      throw new Error("Invalid email address. No user account found with this email.");
    }

    // Check account status
    if (user.status === "Inactive") {
      throw new Error("This account is inactive.");
    }

    // Check password
    const userPass = user.password || "password123";
    const acceptedDemoPasswords = ["password123", "123456", "admin123", "salesman123", "cashier123"];
    const isMatch = userPass === cleanPassword || acceptedDemoPasswords.includes(cleanPassword);

    if (!isMatch) {
      throw new Error("Incorrect password.");
    }

    // Persist current session
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }

    return user;
  },

  getCurrentUser(): User | null {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.error("Failed to read user from localStorage", err);
      return null;
    }
  },

  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  },
};
