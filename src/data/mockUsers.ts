import { User } from "@/types";

export interface DemoAccount {
  user: User;
  passwords: string[];
}

export const initialUsers: User[] = [
  {
    id: "usr-001",
    name: "Dr. Tanvir Ahmed",
    email: "admin@gmail.com",
    role: "Admin",
    status: "Active",
    phone: "+880 1711-000001",
    createdAt: "2024-01-15T09:00:00.000Z",
    password: "password123",
  },
  {
    id: "usr-002",
    name: "Mohammad Rafiq",
    email: "cashier@gmail.com",
    role: "Salesman",
    status: "Active",
    phone: "+880 1812-345678",
    createdAt: "2024-02-01T10:00:00.000Z",
    password: "password123",
  },
  {
    id: "usr-003",
    name: "Nusrat Jahan",
    email: "nusrat@gmail.com",
    role: "Salesman",
    status: "Active",
    phone: "+880 1913-987654",
    createdAt: "2024-03-10T11:00:00.000Z",
    password: "password123",
  },
  {
    id: "usr-004",
    name: "Arif Hossain",
    email: "arif@gmail.com",
    role: "Salesman",
    status: "Active",
    phone: "+880 1614-554433",
    createdAt: "2024-04-18T14:30:00.000Z",
    password: "password123",
  },
  {
    id: "usr-005",
    name: "Farhana Yasmin",
    email: "farhana@gmail.com",
    role: "Salesman",
    status: "Inactive",
    phone: "+880 1515-778899",
    createdAt: "2024-05-22T09:15:00.000Z",
    password: "password123",
  },
];

export const demoAccounts: DemoAccount[] = initialUsers.map((u) => ({
  user: u,
  passwords: ["password123", "123456", "admin123", "salesman123", "cashier123"],
}));
