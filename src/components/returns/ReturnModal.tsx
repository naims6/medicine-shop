"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/shared/Modal";
import { Sale, PaymentMethod, Return } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  X,
  RotateCcw,
  Banknote,
  CircleDollarSign,
  FileSearch,
  PackageCheck,
  ChevronRight,
} from "lucide-react";
import { salesRepository } from "@/repositories/salesRepository";
import { returnRepository } from "@/repositories/returnRepository";
import { useAuth } from "@/stores/AuthContext";

const returnReasons = [
  "Wrong medicine",
  "Expired",
  "Damaged packaging",
  "Side effects",
  "Doctor changed prescription",
  "Not needed",
  "Other",
];

const refundOptions: {
  id: PaymentMethod;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "Cash", label: "Cash", icon: Banknote },
  { id: "Owing", label: "Owing (বাকি)", icon: CircleDollarSign },
];

interface ReturnItemState {
  medicineId: string;
  name: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  unitPrice: number;
  unit: string;
  originalQty: number;
  alreadyReturned: number;
  maxReturnable: number;
  returnQty: number;
  reason: string;
  batchNumber?: string;
  expiryDate?: string;
}

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReturnComplete: (ret: Return) => void;
  preloadedSale?: Sale | null;
}

function ReturnModalContent({
  onClose,
  onReturnComplete,
  preloadedSale,
}: {
  onClose: () => void;
  onReturnComplete: (ret: Return) => void;
  preloadedSale?: Sale | null;
}) {
  const { user } = useAuth();
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(
    preloadedSale || null
  );
  const [returnItems, setReturnItems] = useState<ReturnItemState[]>([]);
  const [refundMethod, setRefundMethod] = useState<PaymentMethod>("Cash");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullyReturned, setFullyReturned] = useState(false);

  // Load all sales on mount (for search)
  useEffect(() => {
    if (!preloadedSale) {
      salesRepository.getAll().then((sales) => {
        setAllSales(sales);
      });
    }
  }, [preloadedSale]);

  // Load return items when a sale is selected
  useEffect(() => {
    let isCancelled = false;
    if (selectedSale) {
      void returnRepository
        .getReturnedQuantitiesForSale(selectedSale.id)
        .then((returnedMap) => {
          if (isCancelled) return;
          const items: ReturnItemState[] = selectedSale.items.map((item) => {
            const alreadyReturned = returnedMap.get(item.medicineId) || 0;
            const maxReturnable = Math.max(0, item.quantity - alreadyReturned);
            return {
              medicineId: item.medicineId,
              name: item.name,
              genericName: item.genericName,
              strength: item.strength,
              dosageForm: item.dosageForm,
              unitPrice: item.unitPrice,
              unit: item.unit,
              originalQty: item.quantity,
              alreadyReturned,
              maxReturnable,
              returnQty: 0,
              reason: returnReasons[0],
              batchNumber: item.batchNumber,
              expiryDate: item.expiryDate,
            };
          });

          const allFullyReturned = items.every((i) => i.maxReturnable === 0);
          setFullyReturned(allFullyReturned);
          setReturnItems(items);
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [selectedSale]);

  // Smart search — search by medicine name, invoice #, cashier, notes
  const matchingSales = useMemo(() => {
    if (preloadedSale) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allSales.slice(0, 10); // Show 10 recent sales by default

    return allSales.filter((s) => {
      return (
        s.invoiceNumber.toLowerCase().includes(q) ||
        s.cashierName.toLowerCase().includes(q) ||
        (s.notes && s.notes.toLowerCase().includes(q)) ||
        s.items.some(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.genericName.toLowerCase().includes(q)
        )
      );
    });
  }, [allSales, searchQuery, preloadedSale]);

  const handleSelectSale = (sale: Sale) => {
    setSelectedSale(sale);
    setReturnItems([]);
    setFullyReturned(false);
  };

  const handleBackToSearch = () => {
    setSelectedSale(null);
    setReturnItems([]);
    setFullyReturned(false);
  };

  const updateReturnQty = (medicineId: string, qty: number) => {
    setReturnItems((prev) =>
      prev.map((item) => {
        if (item.medicineId === medicineId) {
          const safeQty = Math.max(0, Math.min(item.maxReturnable, qty));
          return { ...item, returnQty: safeQty };
        }
        return item;
      })
    );
  };

  const updateReason = (medicineId: string, reason: string) => {
    setReturnItems((prev) =>
      prev.map((item) =>
        item.medicineId === medicineId ? { ...item, reason } : item
      )
    );
  };

  const selectedItems = returnItems.filter((i) => i.returnQty > 0);
  const totalReturnQty = selectedItems.reduce(
    (acc, i) => acc + i.returnQty,
    0
  );
  const totalRefundAmount = selectedItems.reduce(
    (acc, i) => acc + i.returnQty * i.unitPrice,
    0
  );

  const handleProcessReturn = async () => {
    if (!selectedSale || selectedItems.length === 0 || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const ret = await returnRepository.create({
        processedBy: user?.name || "Mohammad Rafiq",
        originalSaleId: selectedSale.id,
        originalInvoiceNumber: selectedSale.invoiceNumber,
        items: selectedItems.map((i) => ({
          medicineId: i.medicineId,
          name: i.name,
          genericName: i.genericName,
          strength: i.strength,
          dosageForm: i.dosageForm as import("@/types").DosageForm,
          unitPrice: i.unitPrice,
          unit: i.unit,
          quantity: i.returnQty,
          subtotal: Number((i.returnQty * i.unitPrice).toFixed(2)),
          batchNumber: i.batchNumber,
          expiryDate: i.expiryDate,
          reason: i.reason,
        })),
        totalItems: totalReturnQty,
        totalRefundAmount: Number(totalRefundAmount.toFixed(2)),
        refundMethod,
        notes: notes.trim() || undefined,
      });

      onClose();
      onReturnComplete(ret);
    } catch (err) {
      console.error("Return processing failed:", err);
      alert("Failed to process return. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── STEP 1: Search & select a sale ───
  if (!selectedSale && !preloadedSale) {
    return (
      <div className="space-y-3">
        {/* Search bar */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Search by medicine name, invoice number, or customer
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Napa, Seclo, INV-2026..., Rahim..."
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Matching sales list */}
        <div className="max-h-[380px] overflow-y-auto space-y-1.5 pr-1">
          {matchingSales.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <FileSearch className="w-9 h-9 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">
                No sales found
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Try a different medicine name or invoice number
              </p>
            </div>
          ) : (
            <>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider px-1">
                {searchQuery
                  ? `${matchingSales.length} matching sales`
                  : "Recent sales — search to find more"}
              </p>
              {matchingSales.map((sale) => (
                <button
                  key={sale.id}
                  type="button"
                  onClick={() => handleSelectSale(sale)}
                  className="w-full text-left border border-slate-200 rounded-lg p-3 hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {sale.invoiceNumber}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                          sale.paymentMethod === "Owing"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {sale.paymentMethod}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {new Date(sale.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        • {sale.totalItems} items •{" "}
                        <span className="font-mono font-bold text-slate-700">
                          {formatCurrency(sale.totalAmount)}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {sale.items.map((i) => i.name).join(", ")}
                        {sale.notes && (
                          <span className="text-blue-500 ml-1">
                            • {sale.notes}
                          </span>
                        )}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 shrink-0" />
                  </div>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Cancel button */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ─── STEP 2: Select items to return ───
  const activeSale = selectedSale || preloadedSale;

  return (
    <div className="space-y-4">
      {/* Selected Sale Info Card */}
      {activeSale && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono font-bold text-slate-900">
                {activeSale.invoiceNumber}
              </span>
              <span className="text-slate-400 mx-2">•</span>
              <span className="text-slate-500">
                {new Date(activeSale.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900">
                {formatCurrency(activeSale.totalAmount)}
              </span>
              {!preloadedSale && (
                <button
                  type="button"
                  onClick={handleBackToSearch}
                  className="text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  Change
                </button>
              )}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {activeSale.items.map((i) => i.name).join(", ")}
            {activeSale.notes && (
              <span className="text-blue-500 ml-1">
                • {activeSale.notes}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Fully Returned Notice */}
      {fullyReturned && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs">
          <PackageCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-medium">
            All items from this invoice have already been fully returned.
          </span>
        </div>
      )}

      {/* Return Items Selection */}
      {returnItems.length > 0 && !fullyReturned && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
            Select Items to Return
          </label>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {returnItems.map((item) => (
              <div
                key={item.medicineId}
                className={`border rounded-lg p-3 transition-colors ${
                  item.returnQty > 0
                    ? "border-emerald-300 bg-emerald-50/50"
                    : item.maxReturnable === 0
                    ? "border-slate-100 bg-slate-50/50 opacity-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {item.genericName} • {item.strength} • {item.dosageForm}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Purchased: {item.originalQty} {item.unit}s @{" "}
                      {formatCurrency(item.unitPrice)}
                      {item.alreadyReturned > 0 && (
                        <span className="text-blue-600 ml-1">
                          (Already returned: {item.alreadyReturned})
                        </span>
                      )}
                    </p>
                  </div>

                  {item.maxReturnable > 0 ? (
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateReturnQty(
                              item.medicineId,
                              item.returnQty - 1
                            )
                          }
                          disabled={item.returnQty <= 0}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={item.maxReturnable}
                          value={item.returnQty}
                          onChange={(e) =>
                            updateReturnQty(
                              item.medicineId,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-12 text-center py-0.5 text-xs font-mono font-bold border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateReturnQty(
                              item.medicineId,
                              item.returnQty + 1
                            )
                          }
                          disabled={item.returnQty >= item.maxReturnable}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          +
                        </button>
                        <span className="text-[10px] text-slate-400 ml-0.5">
                          / {item.maxReturnable}
                        </span>
                      </div>

                      {item.maxReturnable > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            updateReturnQty(
                              item.medicineId,
                              item.returnQty === item.maxReturnable
                                ? 0
                                : item.maxReturnable
                            )
                          }
                          className="text-[10px] text-emerald-700 hover:underline font-medium cursor-pointer"
                        >
                          {item.returnQty === item.maxReturnable
                            ? "Clear"
                            : "Return All"}
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      Fully returned
                    </span>
                  )}
                </div>

                {item.returnQty > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-semibold text-slate-500 shrink-0">
                        Reason:
                      </label>
                      <select
                        value={item.reason}
                        onChange={(e) =>
                          updateReason(item.medicineId, e.target.value)
                        }
                        className="flex-1 px-2 py-1 text-[11px] bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {returnReasons.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs font-mono font-bold text-emerald-700 shrink-0">
                        {formatCurrency(item.returnQty * item.unitPrice)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refund Method & Notes */}
      {selectedItems.length > 0 && (
        <>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Refund Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {refundOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = refundMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRefundMethod(opt.id)}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/80 text-emerald-800 ring-2 ring-emerald-500/20 font-semibold"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isSelected ? "text-emerald-600" : "text-slate-500"
                      }`}
                    />
                    <span className="text-xs">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="return-notes"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Return Notes (Optional)
            </label>
            <input
              id="return-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Customer name, phone, or details"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Refund Summary */}
          <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Total Refund Amount
              </p>
              <p className="text-xl font-bold font-mono tracking-tight text-white mt-0.5">
                {formatCurrency(totalRefundAmount)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {totalReturnQty} items • {refundMethod === "Owing" ? "Adjusted from owing" : "Cash refund"} • Stock will be restored
              </p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-sans font-semibold">
                Refund
              </span>
              <span className="text-rose-400 font-bold text-lg font-mono">
                ৳{totalRefundAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-1">
        <button
          type="button"
          onClick={!preloadedSale && selectedSale ? handleBackToSearch : onClose}
          className="py-2.5 px-4 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer text-center"
        >
          {!preloadedSale && selectedSale ? "← Back to Search" : "Cancel"}
        </button>
        <button
          type="button"
          onClick={handleProcessReturn}
          disabled={selectedItems.length === 0 || isSubmitting}
          className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-2.5 px-4 rounded-lg font-bold text-xs text-white transition-all shadow-sm ${
            selectedItems.length === 0 || isSubmitting
              ? "bg-slate-300 cursor-not-allowed text-slate-500"
              : "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-200 cursor-pointer"
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>
            {isSubmitting
              ? "Processing Return..."
              : "Process Return & Restore Stock"}
          </span>
        </button>
      </div>
    </div>
  );
}

export function ReturnModal({
  isOpen,
  onClose,
  onReturnComplete,
  preloadedSale,
}: ReturnModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Process Medicine Return"
      description="Search the sale, select items to return — stock will be restored automatically"
      maxWidth="max-w-2xl"
    >
      <ReturnModalContent
        onClose={onClose}
        onReturnComplete={onReturnComplete}
        preloadedSale={preloadedSale}
      />
    </Modal>
  );
}
