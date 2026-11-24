// Matches DashboardSummaryResponseDto from the backend
export interface DashboardSummary {
  todaySalesAmount: number;
  todayTransactionsCount: number;
  weeklySalesAmount: number;
  weeklyTransactionsCount: number;
  monthlySalesAmount: number;
  monthlyTransactionsCount: number;
  totalOwingAmount: number;
  owingTransactionsCount: number;
  totalTransactions: number;
  totalRevenue: number;
}

// Matches TrendPointDto
export interface TrendPoint {
  label: string;
  date: string;
  amount: number;
  count: number;
}

// Matches TrendPeriodMetaDto
export interface TrendPeriodMeta {
  interval: "day" | "month";
  limit: number;
  page: number;
  hasPrevious: boolean;
  hasNext: boolean;
  startDate: string;
  endDate: string;
}

// Matches SalesTrendResponseDto
export interface SalesTrend {
  period: TrendPeriodMeta;
  points: TrendPoint[];
  totalRevenue: number;
  totalOrders: number;
}

// Query params for GET /dashboard/sales-trend
export interface SalesTrendQuery {
  interval?: "day" | "month";
  limit?: number;
  page?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
}

// Legacy type retained only for not-yet-migrated mock features.
// Remove once all dashboard data is fully API-driven.
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
  recentTransactions: import("./sale.types").Sale[];
  lowStockCount: number;
  lowStockMedicines: import("./medicine.types").Medicine[];
  expiringCount: number;
  expiredCount: number;
  expiringAlerts: import("./medicine.types").ExpiringBatchAlert[];
  totalRevenue?: number;
  averageTransactionValue?: number;
  totalMedicinesSold?: number;
}
