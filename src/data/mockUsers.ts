import { User } from "@/types";

export interface DemoAccount {
  user: User;
  passwords: string[]; // Accepts easy passwords like "password123", "123456"
}

export const demoAccounts: DemoAccount[] = [
  {
    user: {
      id: "user-cashier-01",
      name: "Mohammad Rafiq",
      email: "cashier@gmail.com",
      role: "cashier",
      counter: "Counter 01",
      shift: "Day Shift",
    },
    passwords: ["password123", "123456", "cashier123", "admin123"],
  },
  {
    user: {
      id: "user-admin-01",
      name: "Dr. Tanvir Ahmed (Admin)",
      email: "admin@gmail.com",
      role: "admin",
      counter: "Admin Desk",
      shift: "All Shifts",
    },
    passwords: ["password123", "123456", "admin123"],
  },
];
