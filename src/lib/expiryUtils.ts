import { Medicine, MedicineBatch } from "@/types";

export type ExpiryStatus = "expired" | "critical" | "warning" | "good";

export interface BatchAnalysis {
  status: ExpiryStatus;
  daysRemaining: number;
  label: string;
  badgeClass: string;
}

/**
 * Calculates days remaining from today (local time) to the given expiry date.
 * Expiry dates in pharmacy are typically valid until the last day of the stated date/month.
 */
export function getDaysRemaining(expiryDate: string): number {
  if (!expiryDate) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exp = new Date(expiryDate);
  exp.setHours(23, 59, 59, 999);

  const diffTime = exp.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Analyzes the expiry date of a batch.
 * - Expired: days < 0
 * - Critical: 0 <= days <= 30
 * - Warning: 31 <= days <= 90
 * - Good: days > 90
 */
export function getBatchAnalysis(expiryDate: string): BatchAnalysis {
  const days = getDaysRemaining(expiryDate);

  if (days < 0) {
    const passed = Math.abs(days);
    return {
      status: "expired",
      daysRemaining: days,
      label: `Expired (${passed}d ago)`,
      badgeClass: "bg-red-50 text-red-700 border-red-200",
    };
  }

  if (days <= 30) {
    return {
      status: "critical",
      daysRemaining: days,
      label: `Exp: ${days}d left`,
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300 font-semibold",
    };
  }

  if (days <= 90) {
    return {
      status: "warning",
      daysRemaining: days,
      label: `Exp: ${days}d left`,
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    };
  }

  return {
    status: "good",
    daysRemaining: days,
    label: formatExpiryDate(expiryDate),
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
}

/**
 * Formats ISO "YYYY-MM-DD" into compact readable "Mon YYYY" or "DD MMM YYYY".
 */
export function formatExpiryDate(expiryDate: string): string {
  if (!expiryDate) return "N/A";
  try {
    const d = new Date(expiryDate);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return expiryDate;
  }
}

/**
 * FEFO Helper: Finds the active non-expired batch with the earliest expiration date.
 * If all batches are expired, returns undefined unless allowExpired is true.
 */
export function getEarliestDispensingBatch(
  batches?: MedicineBatch[],
  allowExpired = false
): MedicineBatch | undefined {
  if (!batches || batches.length === 0) return undefined;

  const validBatches = batches.filter((b) => {
    if (b.stock <= 0) return false;
    if (allowExpired) return true;
    return getDaysRemaining(b.expiryDate) >= 0;
  });

  if (validBatches.length === 0) {
    // If no valid non-expired batch with stock > 0, return undefined
    return undefined;
  }

  return [...validBatches].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  )[0];
}

/**
 * Checks if a medicine has any sellable (non-expired) stock.
 */
export function hasSellableStock(medicine: Medicine): boolean {
  if (medicine.currentStock <= 0) return false;
  if (!medicine.batches || medicine.batches.length === 0) return true;

  return medicine.batches.some(
    (b) => b.stock > 0 && getDaysRemaining(b.expiryDate) >= 0
  );
}

/**
 * Gets the total sellable (non-expired) stock count for a medicine.
 */
export function getSellableStockCount(medicine: Medicine): number {
  if (!medicine.batches || medicine.batches.length === 0) {
    return medicine.currentStock || 0;
  }
  return medicine.batches
    .filter((b) => getDaysRemaining(b.expiryDate) >= 0)
    .reduce((sum, b) => sum + Math.max(0, b.stock), 0);
}
