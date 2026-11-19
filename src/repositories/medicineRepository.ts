import { Medicine, MedicineBatch } from "@/types";
import { initialMedicines } from "@/data/mockMedicines";
import { getDaysRemaining } from "@/lib/expiryUtils";

const STORAGE_KEY = "shodesh_medicines_v3";

function getStoredMedicines(): Medicine[] {
  if (typeof window === "undefined") {
    return initialMedicines;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMedicines));
      return initialMedicines;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMedicines));
      return initialMedicines;
    }

    return parsed.map((m: Record<string, unknown>) => {
      const stock = typeof m.currentStock === "number" ? m.currentStock : 50;
      const minAlert = typeof m.minStockAlert === "number" ? m.minStockAlert : 20;

      // Ensure batches array exists
      let batches: MedicineBatch[] = [];
      if (Array.isArray(m.batches) && m.batches.length > 0) {
        batches = m.batches as MedicineBatch[];
      } else {
        // Fallback default batch for legacy storage
        batches = [
          {
            id: `bat-def-${m.id}`,
            batchNumber: `BX-${String(m.id).slice(-4)}`,
            expiryDate: "2027-12-31",
            stock,
          },
        ];
      }

      // Re-sum total stock from active batches
      const computedStock = batches.reduce((sum, b) => sum + (Number(b.stock) || 0), 0);

      return {
        ...m,
        currentStock: computedStock,
        minStockAlert: minAlert,
        batches,
      };
    }) as Medicine[];
  } catch (err) {
    console.error("Failed to load medicines from localStorage:", err);
    return initialMedicines;
  }
}

function saveStoredMedicines(medicines: Medicine[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
  } catch (err) {
    console.error("Failed to save medicines to localStorage:", err);
  }
}

export interface IMedicineRepository {
  getAll(includeInactive?: boolean): Promise<Medicine[]>;
  getById(id: string): Promise<Medicine | null>;
  search(
    query: string,
    options?: {
      category?: string;
      dosageForm?: string;
      stockFilter?: "all" | "low" | "out" | "expiring" | "expired";
      includeInactive?: boolean;
    }
  ): Promise<Medicine[]>;
  create(data: Omit<Medicine, "id">): Promise<Medicine>;
  update(id: string, updates: Partial<Medicine>): Promise<Medicine>;
  toggleActive(id: string): Promise<Medicine>;
  deductStock(items: { medicineId: string; quantity: number }[]): Promise<void>;
  addStock(
    medicineId: string,
    quantityToAdd: number,
    batchNumber?: string,
    expiryDate?: string
  ): Promise<Medicine>;
  updateStock(medicineId: string, newStock: number): Promise<Medicine>;
  getLowStockMedicines(): Promise<Medicine[]>;
  getExpiringBatches(
    daysThreshold?: number
  ): Promise<{ medicine: Medicine; batch: MedicineBatch; daysRemaining: number }[]>;
  resetToDefault(): Promise<void>;
}

export const medicineRepository: IMedicineRepository = {
  async getAll(includeInactive = false): Promise<Medicine[]> {
    const medicines = getStoredMedicines();
    if (includeInactive) return medicines;
    return medicines.filter((m) => m.isActive);
  },

  async getById(id: string): Promise<Medicine | null> {
    const medicines = getStoredMedicines();
    const found = medicines.find((m) => m.id === id);
    return found || null;
  },

  async search(
    query: string,
    options?: {
      category?: string;
      dosageForm?: string;
      stockFilter?: "all" | "low" | "out" | "expiring" | "expired";
      includeInactive?: boolean;
    }
  ): Promise<Medicine[]> {
    const medicines = getStoredMedicines();
    const q = query.trim().toLowerCase();

    return medicines.filter((m) => {
      if (!options?.includeInactive && !m.isActive) return false;
      if (options?.category && options.category !== "All" && m.category !== options.category) {
        return false;
      }
      if (options?.dosageForm && options.dosageForm !== "All" && m.dosageForm !== options.dosageForm) {
        return false;
      }

      // Stock and Expiry filters
      if (options?.stockFilter === "low" && (m.currentStock <= 0 || m.currentStock > m.minStockAlert)) {
        return false;
      }
      if (options?.stockFilter === "out" && m.currentStock > 0) {
        return false;
      }
      if (options?.stockFilter === "expiring") {
        const hasExpiringBatch = (m.batches || []).some((b) => {
          const days = getDaysRemaining(b.expiryDate);
          return b.stock > 0 && days >= 0 && days <= 90;
        });
        if (!hasExpiringBatch) return false;
      }
      if (options?.stockFilter === "expired") {
        const hasExpiredBatch = (m.batches || []).some((b) => {
          const days = getDaysRemaining(b.expiryDate);
          return b.stock > 0 && days < 0;
        });
        if (!hasExpiredBatch) return false;
      }

      if (!q) return true;

      return (
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.strength.toLowerCase().includes(q) ||
        m.manufacturer.toLowerCase().includes(q) ||
        (m.batches || []).some((b) => b.batchNumber.toLowerCase().includes(q))
      );
    });
  },

  async create(data: Omit<Medicine, "id">): Promise<Medicine> {
    const medicines = getStoredMedicines();
    const stock = Number(data.currentStock) || 0;
    const defaultBatch: MedicineBatch = {
      id: `bat-${Date.now()}`,
      batchNumber: `BT-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      stock,
    };

    const newMedicine: Medicine = {
      ...data,
      id: `med-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isActive: data.isActive !== undefined ? data.isActive : true,
      currentStock: stock,
      minStockAlert: Number(data.minStockAlert) || 20,
      batches: data.batches && data.batches.length > 0 ? data.batches : [defaultBatch],
    };
    const updated = [newMedicine, ...medicines];
    saveStoredMedicines(updated);
    return newMedicine;
  },

  async update(id: string, updates: Partial<Medicine>): Promise<Medicine> {
    const medicines = getStoredMedicines();
    const index = medicines.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error(`Medicine with id ${id} not found`);
    }

    const current = medicines[index];
    const newBatches = updates.batches || current.batches || [];
    const computedStock =
      updates.currentStock !== undefined
        ? Number(updates.currentStock)
        : newBatches.length > 0
        ? newBatches.reduce((acc, b) => acc + (Number(b.stock) || 0), 0)
        : current.currentStock;

    const updatedItem: Medicine = {
      ...current,
      ...updates,
      currentStock: computedStock,
      minStockAlert: updates.minStockAlert !== undefined ? Number(updates.minStockAlert) : current.minStockAlert,
      batches: newBatches,
    };
    medicines[index] = updatedItem;
    saveStoredMedicines(medicines);
    return updatedItem;
  },

  async toggleActive(id: string): Promise<Medicine> {
    const medicines = getStoredMedicines();
    const index = medicines.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error(`Medicine with id ${id} not found`);
    }
    medicines[index].isActive = !medicines[index].isActive;
    saveStoredMedicines(medicines);
    return medicines[index];
  },

  /**
   * FEFO (First Expiring, First Out) Stock Deduction:
   * Decrements stock starting with the batch that expires earliest.
   */
  async deductStock(items: { medicineId: string; quantity: number }[]): Promise<void> {
    const medicines = getStoredMedicines();
    let hasChanged = false;

    items.forEach((item) => {
      const idx = medicines.findIndex((m) => m.id === item.medicineId);
      if (idx > -1) {
        const med = medicines[idx];
        let remainingToDeduct = item.quantity;

        if (med.batches && med.batches.length > 0) {
          // Sort batches by expiry date ascending (FEFO)
          med.batches.sort(
            (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
          );

          // Deduct from earliest valid non-expired batches first
          for (const batch of med.batches) {
            if (remainingToDeduct <= 0) break;
            if (batch.stock <= 0) continue;

            const deductAmount = Math.min(batch.stock, remainingToDeduct);
            batch.stock -= deductAmount;
            remainingToDeduct -= deductAmount;
          }

          // If still remaining (e.g. all non-expired batches exhausted), deduct from any batch
          if (remainingToDeduct > 0) {
            for (const batch of med.batches) {
              if (remainingToDeduct <= 0) break;
              if (batch.stock <= 0) continue;
              const deductAmount = Math.min(batch.stock, remainingToDeduct);
              batch.stock -= deductAmount;
              remainingToDeduct -= deductAmount;
            }
          }

          // Update total current stock as sum of remaining batch stocks
          med.currentStock = med.batches.reduce((sum, b) => sum + Math.max(0, b.stock), 0);
        } else {
          med.currentStock = Math.max(0, (med.currentStock || 0) - item.quantity);
        }

        hasChanged = true;
      }
    });

    if (hasChanged) {
      saveStoredMedicines(medicines);
    }
  },

  /**
   * Restock units with batch and expiry tracking.
   */
  async addStock(
    medicineId: string,
    quantityToAdd: number,
    batchNumber?: string,
    expiryDate?: string
  ): Promise<Medicine> {
    const medicines = getStoredMedicines();
    const index = medicines.findIndex((m) => m.id === medicineId);
    if (index === -1) {
      throw new Error(`Medicine with id ${medicineId} not found`);
    }
    const safeAdd = Math.max(0, quantityToAdd);
    const med = medicines[index];

    if (!med.batches) {
      med.batches = [];
    }

    const bNumber = (batchNumber || `BT-${Math.floor(1000 + Math.random() * 9000)}`).trim();
    const expDate =
      expiryDate ||
      new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    // Check if batch with this number already exists
    const existingBatchIndex = med.batches.findIndex(
      (b) => b.batchNumber.toLowerCase() === bNumber.toLowerCase()
    );

    if (existingBatchIndex > -1) {
      med.batches[existingBatchIndex].stock += safeAdd;
      if (expiryDate) {
        med.batches[existingBatchIndex].expiryDate = expiryDate;
      }
    } else {
      med.batches.push({
        id: `bat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        batchNumber: bNumber,
        expiryDate: expDate,
        stock: safeAdd,
      });
    }

    med.currentStock = med.batches.reduce((sum, b) => sum + Math.max(0, b.stock), 0);
    saveStoredMedicines(medicines);
    return med;
  },

  async updateStock(medicineId: string, newStock: number): Promise<Medicine> {
    const medicines = getStoredMedicines();
    const index = medicines.findIndex((m) => m.id === medicineId);
    if (index === -1) {
      throw new Error(`Medicine with id ${medicineId} not found`);
    }
    const safeStock = Math.max(0, newStock);
    medicines[index].currentStock = safeStock;

    if (medicines[index].batches && medicines[index].batches.length > 0) {
      // Allocate to first batch
      medicines[index].batches[0].stock = safeStock;
    }
    saveStoredMedicines(medicines);
    return medicines[index];
  },

  async getLowStockMedicines(): Promise<Medicine[]> {
    const medicines = getStoredMedicines();
    return medicines.filter((m) => m.isActive && m.currentStock <= m.minStockAlert);
  },

  async getExpiringBatches(
    daysThreshold = 90
  ): Promise<{ medicine: Medicine; batch: MedicineBatch; daysRemaining: number }[]> {
    const medicines = getStoredMedicines();
    const results: { medicine: Medicine; batch: MedicineBatch; daysRemaining: number }[] = [];

    medicines.forEach((med) => {
      if (!med.isActive || !med.batches) return;
      med.batches.forEach((b) => {
        if (b.stock <= 0) return;
        const days = getDaysRemaining(b.expiryDate);
        if (days <= daysThreshold) {
          results.push({ medicine: med, batch: b, daysRemaining: days });
        }
      });
    });

    return results.sort((a, b) => a.daysRemaining - b.daysRemaining);
  },

  async resetToDefault(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMedicines));
    }
  },
};
