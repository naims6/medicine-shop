import { Return, PaymentMethod } from "@/types";
import { medicineRepository } from "./medicineRepository";

const RETURNS_STORAGE_KEY = "pharmacare_returns_v1";

function getStoredReturns(): Return[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RETURNS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error("Failed to load returns from localStorage:", err);
    return [];
  }
}

function saveStoredReturns(returns: Return[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RETURNS_STORAGE_KEY, JSON.stringify(returns));
  } catch (err) {
    console.error("Failed to save returns to localStorage:", err);
  }
}

function generateReturnNumber(returnsCount: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const seq = String(returnsCount + 1).padStart(4, "0");
  return `RET-${year}${month}${day}-${seq}`;
}

export interface IReturnRepository {
  getAll(): Promise<Return[]>;
  getById(id: string): Promise<Return | null>;
  getBySaleId(saleId: string): Promise<Return[]>;
  getReturnedQuantitiesForSale(saleId: string): Promise<Map<string, number>>;
  create(
    input: Omit<Return, "id" | "returnNumber" | "createdAt">
  ): Promise<Return>;
  search(filters: {
    query?: string;
    startDate?: string;
    endDate?: string;
    refundMethod?: PaymentMethod | "All";
  }): Promise<Return[]>;
  getTodayStats(): Promise<{ count: number; totalAmount: number }>;
  resetToDefault(): Promise<void>;
}

export const returnRepository: IReturnRepository = {
  async getAll(): Promise<Return[]> {
    const returns = getStoredReturns();
    return [...returns].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getById(id: string): Promise<Return | null> {
    const returns = getStoredReturns();
    return returns.find((r) => r.id === id) || null;
  },

  async getBySaleId(saleId: string): Promise<Return[]> {
    const returns = getStoredReturns();
    return returns
      .filter((r) => r.originalSaleId === saleId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  },

  async getReturnedQuantitiesForSale(
    saleId: string
  ): Promise<Map<string, number>> {
    const saleReturns = await this.getBySaleId(saleId);
    const map = new Map<string, number>();

    saleReturns.forEach((ret) => {
      ret.items.forEach((item) => {
        const existing = map.get(item.medicineId) || 0;
        map.set(item.medicineId, existing + item.quantity);
      });
    });

    return map;
  },

  async create(
    input: Omit<Return, "id" | "returnNumber" | "createdAt">
  ): Promise<Return> {
    const returns = getStoredReturns();
    const id = `ret-${Date.now()}`;
    const returnNumber = generateReturnNumber(returns.length);
    const createdAt = new Date().toISOString();

    const newReturn: Return = {
      ...input,
      id,
      returnNumber,
      createdAt,
    };

    // Restore stock for each returned item
    for (const item of input.items) {
      if (item.quantity > 0) {
        await medicineRepository.addStock(
          item.medicineId,
          item.quantity,
          item.batchNumber,
          item.expiryDate
        );
      }
    }

    const updated = [newReturn, ...returns];
    saveStoredReturns(updated);
    return newReturn;
  },

  async search(filters: {
    query?: string;
    startDate?: string;
    endDate?: string;
    refundMethod?: PaymentMethod | "All";
  }): Promise<Return[]> {
    const all = await this.getAll();
    const q = filters.query?.trim().toLowerCase();

    return all.filter((r) => {
      if (
        filters.refundMethod &&
        filters.refundMethod !== "All" &&
        r.refundMethod !== filters.refundMethod
      ) {
        return false;
      }
      if (filters.startDate) {
        const rDate = new Date(r.createdAt).setHours(0, 0, 0, 0);
        const start = new Date(filters.startDate).setHours(0, 0, 0, 0);
        if (rDate < start) return false;
      }
      if (filters.endDate) {
        const rDate = new Date(r.createdAt).setHours(23, 59, 59, 999);
        const end = new Date(filters.endDate).setHours(23, 59, 59, 999);
        if (rDate > end) return false;
      }
      if (!q) return true;

      return (
        r.returnNumber.toLowerCase().includes(q) ||
        r.originalInvoiceNumber.toLowerCase().includes(q) ||
        r.processedBy.toLowerCase().includes(q) ||
        r.items.some(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.genericName.toLowerCase().includes(q)
        )
      );
    });
  },

  async getTodayStats(): Promise<{ count: number; totalAmount: number }> {
    const all = getStoredReturns();
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();

    let count = 0;
    let totalAmount = 0;

    all.forEach((r) => {
      const d = new Date(r.createdAt);
      if (
        d.getFullYear() === todayYear &&
        d.getMonth() === todayMonth &&
        d.getDate() === todayDate
      ) {
        count++;
        totalAmount += r.totalRefundAmount;
      }
    });

    return { count, totalAmount };
  },

  async resetToDefault(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.setItem(RETURNS_STORAGE_KEY, JSON.stringify([]));
    }
  },
};
