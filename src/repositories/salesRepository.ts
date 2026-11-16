import { Sale, DashboardMetrics, PaymentMethod } from "@/types";
import { initialSales } from "@/data/mockSales";

const SALES_STORAGE_KEY = "pharmacare_sales_v1";

function getStoredSales(): Sale[] {
  if (typeof window === "undefined") {
    return initialSales;
  }
  try {
    const raw = localStorage.getItem(SALES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(initialSales));
      return initialSales;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(initialSales));
      return initialSales;
    }
    return parsed;
  } catch (err) {
    console.error("Failed to load sales from localStorage:", err);
    return initialSales;
  }
}

function saveStoredSales(sales: Sale[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
  } catch (err) {
    console.error("Failed to save sales to localStorage:", err);
  }
}

function generateInvoiceNumber(salesCount: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const seq = String(salesCount + 1).padStart(4, "0");
  return `INV-${year}${month}${day}-${seq}`;
}

export interface ISalesRepository {
  getAll(): Promise<Sale[]>;
  getById(id: string): Promise<Sale | null>;
  getByInvoiceNumber(invoiceNumber: string): Promise<Sale | null>;
  create(saleInput: Omit<Sale, "id" | "invoiceNumber" | "createdAt">): Promise<Sale>;
  search(filters: {
    query?: string;
    paymentMethod?: PaymentMethod | "All";
    startDate?: string;
    endDate?: string;
  }): Promise<Sale[]>;
  getDashboardMetrics(range?: "today" | "7days" | "30days" | "all"): Promise<DashboardMetrics>;
  resetToDefault(): Promise<void>;
}

export const salesRepository: ISalesRepository = {
  async getAll(): Promise<Sale[]> {
    const sales = getStoredSales();
    return [...sales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getById(id: string): Promise<Sale | null> {
    const sales = getStoredSales();
    const found = sales.find((s) => s.id === id);
    return found || null;
  },

  async getByInvoiceNumber(invoiceNumber: string): Promise<Sale | null> {
    const sales = getStoredSales();
    const found = sales.find((s) => s.invoiceNumber.toLowerCase() === invoiceNumber.toLowerCase());
    return found || null;
  },

  async create(saleInput: Omit<Sale, "id" | "invoiceNumber" | "createdAt">): Promise<Sale> {
    const sales = getStoredSales();
    const id = `sale-${Date.now()}`;
    const invoiceNumber = generateInvoiceNumber(sales.length);
    const createdAt = new Date().toISOString();

    const newSale: Sale = {
      ...saleInput,
      id,
      invoiceNumber,
      createdAt,
      status: "completed",
    };

    const updated = [newSale, ...sales];
    saveStoredSales(updated);
    return newSale;
  },

  async search(filters: {
    query?: string;
    paymentMethod?: PaymentMethod | "All";
    startDate?: string;
    endDate?: string;
  }): Promise<Sale[]> {
    const sales = await this.getAll();
    const q = filters.query?.trim().toLowerCase();

    return sales.filter((s) => {
      if (filters.paymentMethod && filters.paymentMethod !== "All" && s.paymentMethod !== filters.paymentMethod) {
        return false;
      }
      if (filters.startDate) {
        const saleDate = new Date(s.createdAt).setHours(0, 0, 0, 0);
        const start = new Date(filters.startDate).setHours(0, 0, 0, 0);
        if (saleDate < start) return false;
      }
      if (filters.endDate) {
        const saleDate = new Date(s.createdAt).setHours(23, 59, 59, 999);
        const end = new Date(filters.endDate).setHours(23, 59, 59, 999);
        if (saleDate > end) return false;
      }
      if (!q) return true;

      return (
        s.invoiceNumber.toLowerCase().includes(q) ||
        s.cashierName.toLowerCase().includes(q) ||
        s.items.some((item) => item.name.toLowerCase().includes(q) || item.genericName.toLowerCase().includes(q))
      );
    });
  },

  async getDashboardMetrics(range: "today" | "7days" | "30days" | "all" = "today"): Promise<DashboardMetrics> {
    const allSales = await this.getAll();
    const now = new Date();

    const filtered = allSales.filter((s) => {
      const sDate = new Date(s.createdAt);
      if (range === "today") {
        return (
          sDate.getFullYear() === now.getFullYear() &&
          sDate.getMonth() === now.getMonth() &&
          sDate.getDate() === now.getDate()
        );
      }
      if (range === "7days") {
        const diffDays = (now.getTime() - sDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }
      if (range === "30days") {
        const diffDays = (now.getTime() - sDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 30;
      }
      return true;
    });

    const totalRevenue = filtered.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalTransactions = filtered.length;
    const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const totalMedicinesSold = filtered.reduce((acc, s) => acc + s.totalItems, 0);

    // Top selling medicines aggregated
    const medicineSalesMap = new Map<
      string,
      {
        medicineId: string;
        name: string;
        genericName: string;
        strength: string;
        dosageForm: string;
        totalQuantity: number;
        totalRevenue: number;
      }
    >();

    allSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const existing = medicineSalesMap.get(item.medicineId);
        if (existing) {
          existing.totalQuantity += item.quantity;
          existing.totalRevenue += item.subtotal;
        } else {
          medicineSalesMap.set(item.medicineId, {
            medicineId: item.medicineId,
            name: item.name,
            genericName: item.genericName,
            strength: item.strength,
            dosageForm: item.dosageForm,
            totalQuantity: item.quantity,
            totalRevenue: item.subtotal,
          });
        }
      });
    });

    const topSellingMedicines = Array.from(medicineSalesMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    // Weekly Sales: last 7 days daily trend
    const daysMap = new Map<string, { amount: number; count: number; date: string }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = d.toLocaleDateString("en-US", { weekday: "short" });
      const dateKey = d.toISOString().split("T")[0];
      daysMap.set(dateKey, { amount: 0, count: 0, date: dayKey });
    }

    allSales.forEach((sale) => {
      const dateKey = sale.createdAt.split("T")[0];
      if (daysMap.has(dateKey)) {
        const entry = daysMap.get(dateKey)!;
        entry.amount += sale.totalAmount;
        entry.count += 1;
      }
    });

    const weeklySales = Array.from(daysMap.entries()).map(([_, val]) => ({
      day: val.date,
      date: _,
      amount: Math.round(val.amount),
      count: val.count,
    }));

    // Monthly Sales: last 6 months trend
    const monthsMap = new Map<string, { amount: number; count: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toLocaleDateString("en-US", { month: "short" });
      monthsMap.set(monthKey, { amount: 0, count: 0 });
    }

    allSales.forEach((sale) => {
      const d = new Date(sale.createdAt);
      const monthKey = d.toLocaleDateString("en-US", { month: "short" });
      if (monthsMap.has(monthKey)) {
        const entry = monthsMap.get(monthKey)!;
        entry.amount += sale.totalAmount;
        entry.count += 1;
      }
    });

    const monthlySales = Array.from(monthsMap.entries()).map(([month, val]) => ({
      month,
      amount: Math.round(val.amount),
      count: val.count,
    }));

    const recentTransactions = allSales.slice(0, 6);

    return {
      totalRevenue,
      totalTransactions,
      averageTransactionValue,
      totalMedicinesSold,
      weeklySales,
      monthlySales,
      topSellingMedicines,
      recentTransactions,
    };
  },

  async resetToDefault(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(initialSales));
    }
  },
};
