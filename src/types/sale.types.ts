import type { DosageForm } from "./medicine.types";

export type PaymentMethod = "Cash" | "Owing";

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
