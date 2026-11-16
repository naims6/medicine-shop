import { Medicine } from "@/types";
import { initialMedicines } from "@/data/mockMedicines";

const STORAGE_KEY = "pharmacare_medicines_v1";

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
    return parsed;
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
  search(query: string, options?: { category?: string; dosageForm?: string; includeInactive?: boolean }): Promise<Medicine[]>;
  create(data: Omit<Medicine, "id">): Promise<Medicine>;
  update(id: string, updates: Partial<Medicine>): Promise<Medicine>;
  toggleActive(id: string): Promise<Medicine>;
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
    options?: { category?: string; dosageForm?: string; includeInactive?: boolean }
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
      if (!q) return true;

      return (
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.strength.toLowerCase().includes(q) ||
        m.manufacturer.toLowerCase().includes(q)
      );
    });
  },

  async create(data: Omit<Medicine, "id">): Promise<Medicine> {
    const medicines = getStoredMedicines();
    const newMedicine: Medicine = {
      ...data,
      id: `med-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isActive: data.isActive !== undefined ? data.isActive : true,
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
    const updatedItem = { ...medicines[index], ...updates };
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

  async resetToDefault(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMedicines));
    }
  },
};
