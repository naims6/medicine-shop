/**
 * Barrel re-export — import from "@/types" keeps working everywhere.
 * Add new domain types in the per-domain files, not here.
 */

export type {
  DosageForm,
  MedicineBatch,
  Medicine,
  CartItem,
  SaleItemSnapshot,
  ExpiringBatchAlert,
} from "./medicine.types";

export type {
  PaymentMethod,
  Sale,
  ReturnItemSnapshot,
  Return,
} from "./sale.types";

export type {
  DashboardMetrics,
  DashboardSummary,
  SalesTrend,
  SalesTrendQuery,
  TrendPoint,
  TrendPeriodMeta,
} from "./dashboard.types";

export type { UserRole, UserStatus, User } from "./user.types";

export type { AuthRole, AuthStatus, AuthUser, LoginPayload } from "./auth.types";

export type {
  ApiEnvelope,
  PaginationMeta,
  PaginatedApiEnvelope,
  ApiErrorEnvelope,
} from "./api.types";
