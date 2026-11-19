"use client";

import React, { useEffect } from "react";
import { useForm, Resolver } from "react-hook-form";
import * as z from "zod";
import { Medicine, DosageForm } from "@/types";
import { Modal } from "@/components/ui/Modal";

const dosageForms: DosageForm[] = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Suspension",
  "Injection",
  "Eye Drops",
  "Cream",
  "Inhaler",
  "Chewable Tablet",
  "Suppository",
];

const medicineSchema = z.object({
  name: z.string().min(2, "Medicine name is required"),
  genericName: z.string().min(2, "Generic name is required"),
  strength: z.string().min(1, "Strength is required (e.g. 500mg, 20mg)"),
  dosageForm: z.enum([
    "Tablet",
    "Capsule",
    "Syrup",
    "Suspension",
    "Injection",
    "Eye Drops",
    "Cream",
    "Inhaler",
    "Chewable Tablet",
    "Suppository",
  ]),
  manufacturer: z.string().min(2, "Manufacturer is required"),
  category: z.string().min(2, "Category is required"),
  sellingPrice: z.coerce.number().positive("Price must be greater than 0"),
  unit: z.string().min(1, "Unit is required (e.g. Piece, Bottle, Strip)"),
  shelfLocation: z.string().optional(),
  currentStock: z.coerce.number().min(0, "Stock cannot be negative"),
  minStockAlert: z.coerce.number().min(0, "Alert threshold cannot be negative"),
  isActive: z.boolean(),
});

type MedicineFormData = z.infer<typeof medicineSchema>;

const zodFormResolver: Resolver<MedicineFormData> = async (values) => {
  const result = medicineSchema.safeParse(values);
  if (result.success) {
    return {
      values: result.data,
      errors: {},
    };
  }

  const errors: Record<string, { type: string; message: string }> = {};
  result.error.issues.forEach((issue) => {
    const field = String(issue.path[0] || "");
    if (field && !errors[field]) {
      errors[field] = {
        type: issue.code,
        message: issue.message,
      };
    }
  });

  return {
    values: {},
    errors: errors as unknown as Record<string, { type: string; message: string }>,
  };
};

interface MedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MedicineFormData) => Promise<void>;
  initialData?: Medicine | null;
  mode: "create" | "edit";
}

export function MedicineModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: MedicineModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MedicineFormData>({
    resolver: zodFormResolver,
    defaultValues: {
      name: "",
      genericName: "",
      strength: "",
      dosageForm: "Tablet",
      manufacturer: "",
      category: "Analgesic & Antipyretic",
      sellingPrice: 1.0,
      unit: "Piece",
      shelfLocation: "",
      currentStock: 50,
      minStockAlert: 20,
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData && mode === "edit") {
      reset({
        name: initialData.name,
        genericName: initialData.genericName,
        strength: initialData.strength,
        dosageForm: initialData.dosageForm,
        manufacturer: initialData.manufacturer,
        category: initialData.category,
        sellingPrice: initialData.sellingPrice,
        unit: initialData.unit,
        shelfLocation: initialData.shelfLocation || "",
        currentStock: initialData.currentStock ?? 50,
        minStockAlert: initialData.minStockAlert ?? 20,
        isActive: initialData.isActive,
      });
    } else {
      reset({
        name: "",
        genericName: "",
        strength: "",
        dosageForm: "Tablet",
        manufacturer: "",
        category: "Analgesic & Antipyretic",
        sellingPrice: 1.0,
        unit: "Piece",
        shelfLocation: "",
        currentStock: 50,
        minStockAlert: 20,
        isActive: true,
      });
    }
  }, [initialData, mode, reset, isOpen]);

  const onFormSubmit = async (data: MedicineFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Add New Medicine" : "Edit Medicine"}
      description={
        mode === "create"
          ? "Enter medicine specifications to add it to the pharmacy sales catalogue"
          : `Editing specifications for ${initialData?.name}`
      }
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Name and Generic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Brand / Medicine Name *
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="e.g. Napa Extra, Seclo 20"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.name && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Generic Name *
            </label>
            <input
              type="text"
              {...register("genericName")}
              placeholder="e.g. Paracetamol + Caffeine"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.genericName && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.genericName.message}</p>
            )}
          </div>
        </div>

        {/* Strength, Dosage Form & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Strength *
            </label>
            <input
              type="text"
              {...register("strength")}
              placeholder="e.g. 500mg, 20mg, 100ml"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.strength && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.strength.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dosage Form *
            </label>
            <select
              {...register("dosageForm")}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {dosageForms.map((df) => (
                <option key={df} value={df}>
                  {df}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dispensing Unit *
            </label>
            <input
              type="text"
              {...register("unit")}
              placeholder="e.g. Piece, Bottle, Strip"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.unit && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.unit.message}</p>
            )}
          </div>
        </div>

        {/* Manufacturer & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Manufacturer / Company *
            </label>
            <input
              type="text"
              {...register("manufacturer")}
              placeholder="e.g. Square Pharmaceuticals PLC"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.manufacturer && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.manufacturer.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Therapeutic Category *
            </label>
            <input
              type="text"
              {...register("category")}
              placeholder="e.g. Anti-ulcerant, Antibiotic"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.category && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.category.message}</p>
            )}
          </div>
        </div>

        {/* Selling Price & Shelf Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Selling Price (BDT ৳) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                ৳
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                {...register("sellingPrice")}
                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {errors.sellingPrice && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.sellingPrice.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Shelf / Rack Location (Optional)
            </label>
            <input
              type="text"
              {...register("shelfLocation")}
              placeholder="e.g. Rack A-04, Drawer 2"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Level 1: Current Stock & Low Stock Alert */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Available Stock *
            </label>
            <input
              type="number"
              min="0"
              {...register("currentStock")}
              placeholder="e.g. 100"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.currentStock && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.currentStock.message}</p>
            )}
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Units currently on shelves
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Low Stock Alert Limit *
            </label>
            <input
              type="number"
              min="0"
              {...register("minStockAlert")}
              placeholder="e.g. 20"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.minStockAlert && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.minStockAlert.message}</p>
            )}
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Alert when stock drops to or below this
            </span>
          </div>
        </div>

        {/* Active Status Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isActiveCheck"
            {...register("isActive")}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
          />
          <label htmlFor="isActiveCheck" className="text-xs text-slate-700 cursor-pointer select-none">
            Active in POS Catalogue (uncheck to hide from cashier search)
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-200 cursor-pointer"
          >
            {isSubmitting
              ? "Saving..."
              : mode === "create"
              ? "Add to Catalogue"
              : "Update Medicine"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
