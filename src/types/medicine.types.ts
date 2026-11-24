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
