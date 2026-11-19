import { User } from "@/types";
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

    const account = demoAccounts.find(
      (acc) => acc.user.email.toLowerCase() === cleanEmail
    );

    if (!account) {
      throw new Error("Invalid email. Please check your credentials or use a demo account.");
    }

    const isPasswordMatch = account.passwords.includes(cleanPassword);
    if (!isPasswordMatch) {
      throw new Error("Invalid password. For demo testing, use 'password123' or '123456'.");
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(account.user));
    }

    return account.user;
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
