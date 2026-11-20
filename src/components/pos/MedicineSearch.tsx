"use client";

import React, { useState, useEffect } from "react";
import { Medicine, DosageForm } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  getBatchAnalysis,
  getEarliestDispensingBatch,
  hasSellableStock,
  getSellableStockCount,
} from "@/lib/expiryUtils";
import {
  Search,
  Plus,
  Minus,
  MapPin,
  Pill,
  X,
  Filter,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { medicineRepository } from "@/repositories/medicineRepository";
import { useCart } from "@/stores/CartContext";

const commonForms: (DosageForm | "All")[] = [
  "All",
  "Tablet",
  "Capsule",
  "Syrup",
  "Chewable Tablet",
  "Cream",
];

interface MedicineSearchProps {
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export function MedicineSearch({ searchInputRef }: MedicineSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedForm, setSelectedForm] = useState<DosageForm | "All">("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "expiring">("all");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { items, addItem, updateQuantity, removeItem } = useCart();

  // Load initial list and distinct categories
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const allMeds = await medicineRepository.getAll(false);
      setMedicines(allMeds);

      // Extract unique categories
      const cats = Array.from(new Set(allMeds.map((m) => m.category))).sort();
      setCategories(cats);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Filter medicines when query, dosage form, category, or stock filter changes
  useEffect(() => {
    async function filterMeds() {
      const results = await medicineRepository.search(query, {
        dosageForm: selectedForm,
        category: selectedCategory,
        stockFilter: stockFilter === "all" ? undefined : stockFilter,
        includeInactive: false,
      });
      setMedicines(results);
    }
    filterMeds();
  }, [query, selectedForm, selectedCategory, stockFilter]);

  // Map medicineId -> quantity in cart for instant feedback
  const inCartMap = new Map<string, number>();
  items.forEach((item) => {
    inCartMap.set(item.medicineId, item.quantity);
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Search Header */}
      <div className="p-3 sm:p-4 border-b border-slate-200 space-y-2.5 sm:space-y-3 bg-white">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicine name, generic, strength..."
            className="w-full pl-10 pr-10 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-emerald-500 transition-all font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {commonForms.map((form) => (
              <button
                key={form}
                onClick={() => setSelectedForm(form)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors shrink-0 cursor-pointer ${
                  selectedForm === form
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {form}
              </button>
            ))}

            {/* Quick Low Stock Toggle */}
            <button
              onClick={() => setStockFilter(stockFilter === "low" ? "all" : "low")}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer ${
                stockFilter === "low"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Low Stock</span>
            </button>

            {/* Quick Expiring Soon Toggle */}
            <button
              onClick={() => setStockFilter(stockFilter === "expiring" ? "all" : "expiring")}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer ${
                stockFilter === "expiring"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Expiring (&lt;90d)</span>
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Medicines List */}
      <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Loading medicines catalogue...
          </div>
        ) : medicines.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Pill className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">
              No matching medicines found
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Try searching with a generic name or reset filters.
            </p>
            {(query || selectedForm !== "All" || selectedCategory !== "All" || stockFilter !== "all") && (
              <button
                onClick={() => {
                  setQuery("");
                  setSelectedForm("All");
                  setSelectedCategory("All");
                  setStockFilter("all");
                }}
                className="mt-3 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100"
              >
                Reset Search Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {medicines.map((med) => {
              const sellableStock = getSellableStockCount(med);
              const inCartQty = inCartMap.get(med.id) || 0;
              const isOutOfStock = sellableStock <= 0 && med.currentStock <= 0;
              const isFullyExpired = med.currentStock > 0 && !hasSellableStock(med);
              const isLowStock = sellableStock > 0 && sellableStock <= med.minStockAlert;
              const isMaxInCart = inCartQty >= sellableStock;

              const activeBatch = getEarliestDispensingBatch(med.batches);
              const batchAnalysis = activeBatch ? getBatchAnalysis(activeBatch.expiryDate) : null;
              const isBlocked = isOutOfStock || isFullyExpired || isMaxInCart;

              return (
                <div
                  key={med.id}
                  onClick={() => {
                    if (!isBlocked) {
                      addItem(med, 1);
                    }
                  }}
                  className={`p-3 rounded-lg border transition-all text-left flex flex-col justify-between select-none group ${
                    isBlocked
                      ? "border-slate-200 bg-slate-50/80 opacity-70 cursor-not-allowed"
                      : inCartQty > 0
                      ? "border-emerald-300 bg-emerald-50/30 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs cursor-pointer"
                  }`}
                >
                  <div>
                    {/* Top row: Name & Dosage Form */}
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                          {med.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium truncate">
                          {med.genericName}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {med.dosageForm}
                      </span>
                    </div>

                    {/* Strength, Manufacturer & Live Stock Badge */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                        {med.strength}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 truncate max-w-[100px]">
                        {med.manufacturer.split(" ")[0]}
                      </span>
                      <span className="text-slate-300">•</span>

                      {/* Stock Status Badge */}
                      {isFullyExpired ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-300">
                          Expired Batch
                        </span>
                      ) : isOutOfStock ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Low: {sellableStock} left
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                          Stock: {sellableStock}
                        </span>
                      )}
                    </div>

                    {/* Batch and Expiry Pill (FEFO Active Batch) */}
                    {activeBatch && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                        <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          B: {activeBatch.batchNumber}
                        </span>
                        {batchAnalysis && (
                          <span
                            className={`px-1.5 py-0.5 rounded border font-medium ${batchAnalysis.badgeClass}`}
                          >
                            {batchAnalysis.label}
                          </span>
                        )}
                        {(med.batches?.length || 0) > 1 && (
                          <span className="text-[10px] text-slate-400">
                            +{med.batches!.length - 1} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom row: Location, Price, and Add Button */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      {med.shelfLocation && (
                        <>
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{med.shelfLocation}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-sm font-bold font-mono text-slate-900">
                          {formatCurrency(med.sellingPrice)}
                        </span>
                        <span className="text-[10px] text-slate-400 block -mt-1">
                          per {med.unit}
                        </span>
                      </div>

                      {inCartQty > 0 ? (
                        <div
                          className="flex items-center bg-emerald-50 border border-emerald-300 rounded-lg p-0.5 shadow-2xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (inCartQty > 1) {
                                updateQuantity(med.id, inCartQty - 1);
                              } else {
                                removeItem(med.id);
                              }
                            }}
                            className="w-7 h-7 rounded flex items-center justify-center text-emerald-800 hover:bg-emerald-200/80 active:bg-emerald-300 transition-colors"
                            title={inCartQty === 1 ? "Remove item" : "Decrease quantity"}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <span className="w-6 text-center font-mono font-bold text-xs text-emerald-900">
                            {inCartQty}
                          </span>

                          <button
                            type="button"
                            disabled={isMaxInCart}
                            onClick={() => {
                              if (!isMaxInCart) {
                                updateQuantity(med.id, inCartQty + 1);
                              }
                            }}
                            className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
                              isMaxInCart
                                ? "text-slate-300 cursor-not-allowed"
                                : "text-emerald-800 hover:bg-emerald-200/80 active:bg-emerald-300 cursor-pointer"
                            }`}
                            title={isMaxInCart ? "Max available stock reached" : "Add one more"}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isBlocked}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isBlocked) {
                              addItem(med, 1);
                            }
                          }}
                          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-semibold text-xs transition-all ${
                            isBlocked
                              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                              : "bg-emerald-50 hover:bg-emerald-600 active:bg-emerald-700 text-emerald-700 hover:text-white border border-emerald-200 shadow-xs cursor-pointer"
                          }`}
                          title={
                            isFullyExpired
                              ? "Cannot sell: Batch has expired"
                              : isOutOfStock
                              ? "Out of stock"
                              : isMaxInCart
                              ? `All ${sellableStock} sellable stock added to cart`
                              : "Add to cart (FEFO)"
                          }
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="px-3 sm:px-4 py-2 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Showing {medicines.length} medicines</span>
        <span className="hidden sm:inline">Automatic inventory deduction on sale</span>
      </div>
    </div>
  );
}
