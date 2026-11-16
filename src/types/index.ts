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

export type PaymentMethod = "Cash" | "bKash" | "Nagad" | "Card" | "Other";

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

export interface DashboardMetrics {
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionValue: number;
  totalMedicinesSold: number;
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
}
