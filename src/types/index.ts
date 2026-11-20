export type DosageForm =
  | "Tablet"
  | "Capsule"
  | "Syrup"
  | "Suspension"
  | "Injection"
  | "Eye Drops"
  | "Cream"
  | "Inhaler"
  | "Chewable Tablet"
  | "Suppository";

export type PaymentMethod = "Cash" | "Owing";

export interface MedicineBatch {
  id: string;
  batchNumber: string;
  expiryDate: string; // ISO format "YYYY-MM-DD"
  stock: number;
  mfgDate?: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  strength: string;
  dosageForm: DosageForm;
  manufacturer: string;
  category: string;
  sellingPrice: number;
  unit: string;
  isActive: boolean;
  shelfLocation?: string;
  currentStock: number;
  minStockAlert: number;
  batches?: MedicineBatch[];
}

export interface CartItem {
  medicineId: string;
  name: string;
  genericName: string;
  strength: string;
  dosageForm: DosageForm;
  unitPrice: number;
  unit: string;
  quantity: number;
  subtotal: number;
  currentStock: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface SaleItemSnapshot {
  medicineId: string;
  name: string;
  genericName: string;
  strength: string;
  dosageForm: DosageForm;
  unitPrice: number;
  unit: string;
  quantity: number;
  subtotal: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  createdAt: string; // ISO date string
  cashierName: string;
  items: SaleItemSnapshot[];
  totalItems: number;
  subtotal: number;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountReceived: number;
  changeAmount: number;
  notes?: string;
  status: "completed" | "cancelled";
}

export interface ExpiringBatchAlert {
  medicineId: string;
  medicineName: string;
  strength: string;
  dosageForm: DosageForm;
  batchNumber: string;
  expiryDate: string;
  stock: number;
  daysRemaining: number;
  status: "expired" | "critical" | "warning";
}

export interface DashboardMetrics {
  todaySalesAmount: number;
  todayTransactionsCount: number;
  weeklySalesAmount: number;
  weeklyTransactionsCount: number;
  monthlySalesAmount: number;
  monthlyTransactionsCount: number;
  totalTransactions: number;
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

export interface ReturnItemSnapshot {
  medicineId: string;
  name: string;
  genericName: string;
  strength: string;
  dosageForm: DosageForm;
  unitPrice: number;
  unit: string;
  quantity: number;
  subtotal: number;
  batchNumber?: string;
  expiryDate?: string;
  reason: string;
}

export interface Return {
  id: string;
  returnNumber: string;
  createdAt: string;
  processedBy: string;
  originalSaleId: string;
  originalInvoiceNumber: string;
  items: ReturnItemSnapshot[];
  totalItems: number;
  totalRefundAmount: number;
  refundMethod: PaymentMethod;
  notes?: string;
}

export type UserRole = "cashier" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  counter?: string;
  shift?: string;
}

