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
  customerName?: string;
  customerPhone?: string;
  dueAmount?: number;
  dueStatus?: "unpaid" | "partially_paid" | "cleared";
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



// ---------------------------------------------------------------------------
// Auth & API integration layer
// ---------------------------------------------------------------------------
// These types describe the real NestJS backend responses. The legacy `User`
// type above is retained only for not-yet-migrated mock features and will be
// unified with `AuthUser` once the Users module moves to the API.

/** Backend user role enum (src/common/types/role.enum.ts). */
export type AuthRole = "Admin" | "Salesman";

/** Backend user status enum (src/common/types/user-status.enum.ts). */
export type AuthStatus = "Active" | "Inactive";

/** Authenticated user as returned by the backend (UserResponseDto). */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  status: AuthStatus;
  phone: string | null;
  isDeleted: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/** Credentials for POST /auth/login. */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Success envelope returned by every backend endpoint (TransformInterceptor). */
export interface ApiEnvelope<T> {
  success: true;
  statusCode: number;
  message?: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Success envelope for paginated endpoints. */
export interface PaginatedApiEnvelope<T> {
  success: true;
  statusCode: number;
  data: T[];
  meta: PaginationMeta;
  message?: string;
}

/** Error envelope returned on failure (HttpExceptionFilter). */
export interface ApiErrorEnvelope {
  success: false;
  statusCode: number;
  message: string;
  errors?: unknown;
  timestamp: string;
  path: string;
}
