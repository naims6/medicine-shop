"use client";

import React, { useState, useEffect } from "react";
import { Medicine, DosageForm } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Plus,
  MapPin,
  Pill,
  X,
  Filter,
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
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { items, addItem } = useCart();

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

  // Filter medicines when query, dosage form, or category changes
  useEffect(() => {
    async function filterMeds() {
      const results = await medicineRepository.search(query, {
        dosageForm: selectedForm,
        category: selectedCategory,
        includeInactive: false,
      });
      setMedicines(results);
    }
    filterMeds();
  }, [query, selectedForm, selectedCategory]);

  // Map medicineId -> quantity in cart for instant feedback
  const inCartMap = new Map<string, number>();
  items.forEach((item) => {
    inCartMap.set(item.medicineId, item.quantity);
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicine name, generic name, strength (Press F2 to focus)..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-emerald-500 transition-all font-medium"
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

        {/* Quick Filter Badges */}
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
              Try searching with a generic name (e.g. &quot;Paracetamol&quot; or &quot;Omeprazole&quot;) or clear the filter.
            </p>
            {(query || selectedForm !== "All" || selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setQuery("");
                  setSelectedForm("All");
                  setSelectedCategory("All");
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
              const inCartQty = inCartMap.get(med.id) || 0;
              return (
                <div
                  key={med.id}
                  onClick={() => addItem(med, 1)}
                  className={`p-3 rounded-lg border transition-all text-left flex flex-col justify-between cursor-pointer select-none group ${
                    inCartQty > 0
                      ? "border-emerald-300 bg-emerald-50/30 hover:border-emerald-500 hover:bg-emerald-50/50"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
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

                    {/* Strength & Manufacturer */}
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                        {med.strength}
                      </span>
                      <span>•</span>
                      <span className="truncate">{med.manufacturer.split(" ")[0]}</span>
                    </div>
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

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem(med, 1);
                        }}
                        className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                          inCartQty > 0
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                            : "bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-600"
                        }`}
                        title="Add to cart"
                      >
                        {inCartQty > 0 ? (
                          <span className="text-xs font-bold">{inCartQty}</span>
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Showing {medicines.length} medicines</span>
        <span>Click item or press [+] to add to bill</span>
      </div>
    </div>
  );
}
