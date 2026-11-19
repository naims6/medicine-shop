"use client";

import React from "react";
import { Medicine } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { getBatchAnalysis, formatExpiryDate } from "@/lib/expiryUtils";
import { Modal } from "@/components/ui/Modal";
import { Pill, Building2, MapPin, Tag, CheckCircle2, XCircle, Package, AlertTriangle, Layers } from "lucide-react";

interface MedicineDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  onEdit?: (med: Medicine) => void;
}

export function MedicineDetailModal({
  isOpen,
  onClose,
  medicine,
  onEdit,
}: MedicineDetailModalProps) {
  if (!medicine) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Medicine Specifications"
      description={`System ID: ${medicine.id}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {/* Main Header Badge */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{medicine.name}</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {medicine.dosageForm}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{medicine.genericName}</p>
          </div>

          <div className="text-right">
            <span className="text-lg font-bold font-mono text-emerald-700">
              {formatCurrency(medicine.sellingPrice)}
            </span>
            <span className="text-[10px] text-slate-400 block -mt-1">per {medicine.unit}</span>
          </div>
        </div>

        {/* Spec Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Tag className="w-3.5 h-3.5" />
              <span>Strength</span>
            </div>
            <p className="font-semibold text-slate-900">{medicine.strength}</p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Pill className="w-3.5 h-3.5" />
              <span>Category</span>
            </div>
            <p className="font-semibold text-slate-900 truncate">{medicine.category}</p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Building2 className="w-3.5 h-3.5" />
              <span>Manufacturer</span>
            </div>
            <p className="font-semibold text-slate-900 truncate">{medicine.manufacturer}</p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>Shelf Location</span>
            </div>
            <p className="font-semibold text-slate-900">
              {medicine.shelfLocation || "Unassigned"}
            </p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Package className="w-3.5 h-3.5" />
              <span>Current Stock</span>
            </div>
            <p className="font-mono font-bold text-slate-900">
              {medicine.currentStock ?? 0} {medicine.unit}s
            </p>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Alert Threshold</span>
            </div>
            <p className="font-mono font-bold text-amber-700">
              {medicine.minStockAlert ?? 20} {medicine.unit}s
            </p>
          </div>
        </div>

        {/* Batches & Expiry Breakdown */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Batches & Expiry Breakdown</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {medicine.batches?.length || 0} batch{medicine.batches?.length === 1 ? "" : "es"} on shelf
            </span>
          </div>

          {medicine.batches && medicine.batches.length > 0 ? (
            <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-[10px] text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-1.5 px-3">Batch Number</th>
                    <th className="py-1.5 px-3">Expiry Date</th>
                    <th className="py-1.5 px-3 text-center">In Stock</th>
                    <th className="py-1.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicine.batches.map((batch) => {
                    const analysis = getBatchAnalysis(batch.expiryDate);
                    return (
                      <tr key={batch.id} className="hover:bg-slate-50/80">
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">
                          {batch.batchNumber}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          <span className="font-mono">{batch.expiryDate}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5">
                            ({formatExpiryDate(batch.expiryDate)})
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">
                          {batch.stock}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${analysis.badgeClass}`}
                          >
                            {analysis.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No batch records registered.</p>
          )}
        </div>

        {/* Status banner */}
        <div
          className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
            medicine.isActive
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-slate-100 border-slate-200 text-slate-600"
          }`}
        >
          <div className="flex items-center gap-2">
            {medicine.isActive ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-500" />
            )}
            <span className="font-medium">
              {medicine.isActive
                ? "Active: Available for cashier sale in POS terminal"
                : "Inactive: Hidden from cashier search"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(medicine);
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
            >
              Edit Details
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
