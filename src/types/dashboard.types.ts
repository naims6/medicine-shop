import type { Medicine, ExpiringBatchAlert } from "./medicine.types";
import type { Sale } from "./sale.types";

export interface DashboardMetrics {
  todaySalesAmount: number;
  todayTransactionsCount: number;
  weeklySalesAmount: number;
  weeklyTransactionsCount: number;
  monthlySalesAmount: number;
  monthlyTransactionsCount: number;
  totalTransactions: number;
  totalOwingAmount: number;
  owingTransactionsCount: number;
  weeklySales: { day: string; date: string; amount: number; count: number }[];
  monthlySales: { month: string; amount: number; count: number }[];
  topSellingMedicines: {
    medicineId: string;
    name: string;
    genericName: string;
    strength: string;
    dosageForm: string;
    totalQuantity: number;
    totalRevenue: number;
  }[];
  recentTransactions: Sale[];
  lowStockCount: number;
  lowStockMedicines: Medicine[];
  expiringCount: number;
  expiredCount: number;
  expiringAlerts: ExpiringBatchAlert[];
  totalRevenue?: number;
  averageTransactionValue?: number;
  totalMedicinesSold?: number;
}
