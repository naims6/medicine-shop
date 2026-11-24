"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Medicine, DosageForm } from "@/types";
import { medicineRepository } from "@/repositories/medicineRepository";
import { formatCurrency } from "@/lib/utils";
import {
  getBatchAnalysis,
  getEarliestDispensingBatch,
  getDaysRemaining,
  formatExpiryDate,
} from "@/lib/expiryUtils";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Filter,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Pill,
  PackagePlus,
  AlertTriangle,
  PackageX,
  Clock,
  Sparkles,
} from "lucide-react";
import { MedicineModal } from "@/components/medicines/MedicineModal";
import { MedicineDetailModal } from "@/components/medicines/MedicineDetailModal";
import { Modal } from "@/components/shared/Modal";

const allDosageForms: (DosageForm | "All")[] = [
  "All",
  "Tablet",
  "Capsule",
  "Syrup",
  "Chewable Tablet",
  "Cream",
  "Injection",
  "Inhaler",
];

const ITEMS_PER_PAGE = 8;

function generateBatchNumber(manufacturer: string): string {
  const prefix = manufacturer.toLowerCase().includes("beximco")
    ? "BX"
    : manufacturer.toLowerCase().includes("square")
    ? "SQ"
    : manufacturer.toLowerCase().includes("renata")
    ? "REN"
    : "BT";
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${yearSuffix}${randomSuffix}`;
}

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedManufacturer, setSelectedManufacturer] = useState("All");
  const [selectedForm, setSelectedForm] = useState<DosageForm | "All">("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "expiring" | "expired" | "out">("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailMedicine, setDetailMedicine] = useState<Medicine | null>(null);

  // Quick Restock State
  const [restockMedicine, setRestockMedicine] = useState<Medicine | null>(null);
  const [restockAmount, setRestockAmount] = useState<string>("50");
  const [restockBatchNumber, setRestockBatchNumber] = useState<string>("");
  const [restockExpiryDate, setRestockExpiryDate] = useState<string>("");
  const [isRestocking, setIsRestocking] = useState(false);

  const loadMedicines = useCallback(async () => {
    const data = await medicineRepository.getAll(true);
    setMedicines(data);
  }, []);

  useEffect(() => {
    let isMounted = true;
    medicineRepository.getAll(true).then((data) => {
      if (isMounted) {
        setMedicines(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Stock and expiry counts
  const lowStockCount = useMemo(() => {
    return medicines.filter((m) => m.isActive && m.currentStock > 0 && m.currentStock <= m.minStockAlert).length;
  }, [medicines]);

  const outOfStockCount = useMemo(() => {
    return medicines.filter((m) => m.isActive && m.currentStock <= 0).length;
  }, [medicines]);

  const expiringSoonCount = useMemo(() => {
    return medicines.filter((m) => {
      if (!m.isActive || !m.batches) return false;
      return m.batches.some((b) => {
        const days = getDaysRemaining(b.expiryDate);
        return b.stock > 0 && days >= 0 && days <= 90;
      });
    }).length;
  }, [medicines]);

  const expiredCount = useMemo(() => {
    return medicines.filter((m) => {
      if (!m.isActive || !m.batches) return false;
      return m.batches.some((b) => {
        const days = getDaysRemaining(b.expiryDate);
        return b.stock > 0 && days < 0;
      });
    }).length;
  }, [medicines]);

  // Unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(medicines.map((m) => m.category))).sort();
  }, [medicines]);

  // Unique manufacturers
  const manufacturers = useMemo(() => {
    return Array.from(new Set(medicines.map((m) => m.manufacturer).filter(Boolean))).sort();
  }, [medicines]);

  // Filtered medicines
  const filteredMedicines = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return medicines.filter((m) => {
      if (selectedCategory !== "All" && m.category !== selectedCategory) return false;
      if (selectedManufacturer !== "All" && m.manufacturer !== selectedManufacturer) return false;
      if (selectedForm !== "All" && m.dosageForm !== selectedForm) return false;
      if (statusFilter === "Active" && !m.isActive) return false;
      if (statusFilter === "Inactive" && m.isActive) return false;

      // Stock and Expiry Filters
      if (stockFilter === "low" && (m.currentStock <= 0 || m.currentStock > m.minStockAlert)) {
        return false;
      }
      if (stockFilter === "out" && m.currentStock > 0) {
        return false;
      }
      if (stockFilter === "expiring") {
        const hasExpiring = (m.batches || []).some((b) => {
          const days = getDaysRemaining(b.expiryDate);
          return b.stock > 0 && days >= 0 && days <= 90;
        });
        if (!hasExpiring) return false;
      }
      if (stockFilter === "expired") {
        const hasExpired = (m.batches || []).some((b) => {
          const days = getDaysRemaining(b.expiryDate);
          return b.stock > 0 && days < 0;
        });
        if (!hasExpired) return false;
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
  }, [medicines, searchQuery, selectedCategory, selectedManufacturer, selectedForm, statusFilter, stockFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredMedicines.length / ITEMS_PER_PAGE) || 1;
  const paginatedMedicines = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMedicines.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMedicines, currentPage]);

  const handleOpenCreate = () => {
    setSelectedMedicine(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (med: Medicine) => {
    setSelectedMedicine(med);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleOpenDetail = (med: Medicine) => {
    setDetailMedicine(med);
    setIsDetailOpen(true);
  };

  const handleToggleActive = async (med: Medicine) => {
    await medicineRepository.toggleActive(med.id);
    await loadMedicines();
  };

  const handleFormSubmit = async (data: Omit<Medicine, "id">) => {
    if (modalMode === "create") {
      await medicineRepository.create(data);
    } else if (selectedMedicine) {
      await medicineRepository.update(selectedMedicine.id, {
        ...data,
        batches: selectedMedicine.batches,
      });
    }
    await loadMedicines();
  };

  const handleOpenRestock = (med: Medicine) => {
    setRestockMedicine(med);
    setRestockAmount("50");
    setRestockBatchNumber(generateBatchNumber(med.manufacturer));

    // Default expiry date: 2 years from today
    const defExp = new Date();
    defExp.setFullYear(defExp.getFullYear() + 2);
    setRestockExpiryDate(defExp.toISOString().split("T")[0]);
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockMedicine) return;
    const addQty = parseInt(restockAmount, 10);
    if (isNaN(addQty) || addQty <= 0) return;

    try {
      setIsRestocking(true);
      await medicineRepository.addStock(
        restockMedicine.id,
        addQty,
        restockBatchNumber.trim(),
        restockExpiryDate
      );
      await loadMedicines();
      setRestockMedicine(null);
      setRestockAmount("50");
    } finally {
      setIsRestocking(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Inventory & Expiry Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        <div
          onClick={() => {
            setStockFilter("all");
            setCurrentPage(1);
          }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            stockFilter === "all"
              ? "bg-white border-emerald-500 ring-2 ring-emerald-500/10 shadow-xs"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Catalogue
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              All
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {medicines.length}
          </p>
          <span className="text-[11px] text-slate-400">Total registered brands</span>
        </div>

        <div
          onClick={() => {
            setStockFilter("low");
            setCurrentPage(1);
          }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            stockFilter === "low"
              ? "bg-white border-amber-500 ring-2 ring-amber-500/10 shadow-xs"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Low Stock
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Reorder
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-amber-700 mt-1">
            {lowStockCount}
          </p>
          <span className="text-[11px] text-amber-600">Below threshold limit</span>
        </div>

        <div
          onClick={() => {
            setStockFilter("expiring");
            setCurrentPage(1);
          }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            stockFilter === "expiring"
              ? "bg-white border-orange-500 ring-2 ring-orange-500/10 shadow-xs"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-orange-600" />
              Expiring Soon
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200">
              &lt; 90 Days
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-orange-700 mt-1">
            {expiringSoonCount}
          </p>
          <span className="text-[11px] text-orange-600">Requires clearance/return</span>
        </div>

        <div
          onClick={() => {
            setStockFilter("expired");
            setCurrentPage(1);
          }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            stockFilter === "expired"
              ? "bg-white border-red-500 ring-2 ring-red-500/10 shadow-xs"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-red-600" />
              Expired Stock
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200">
              Quarantine
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-red-700 mt-1">
            {expiredCount}
          </p>
          <span className="text-[11px] text-red-600">Do not sell • Blocked</span>
        </div>

        <div
          onClick={() => {
            setStockFilter("out");
            setCurrentPage(1);
          }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            stockFilter === "out"
              ? "bg-white border-rose-500 ring-2 ring-rose-500/10 shadow-xs"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
              <PackageX className="w-3.5 h-3.5 text-rose-600" />
              Out of Stock
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
              0 Stock
            </span>
          </div>
          <p className="text-2xl font-bold font-mono text-rose-700 mt-1">
            {outOfStockCount}
          </p>
          <span className="text-[11px] text-rose-600">Immediate supplier restock</span>
        </div>
      </div>

      {/* Top Controls Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by brand name, generic, batch #, manufacturer..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Add Medicine Button */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shadow-emerald-200 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Medicine</span>
          </button>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-500 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">Filters:</span>
          </div>

          {/* Stock & Expiry Filter Selector */}
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value as "all" | "low" | "expiring" | "expired" | "out");
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
          >
            <option value="all">Filter: All Medicines ({medicines.length})</option>
            <option value="low">Low Stock Only ({lowStockCount})</option>
            <option value="expiring">Expiring Soon (&lt;90d) ({expiringSoonCount})</option>
            <option value="expired">Expired Batches Only ({expiredCount})</option>
            <option value="out">Out of Stock Only ({outOfStockCount})</option>
          </select>

          {/* Dosage Form Filter */}
          <select
            value={selectedForm}
            onChange={(e) => {
              setSelectedForm(e.target.value as DosageForm | "All");
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {allDosageForms.map((df) => (
              <option key={df} value={df}>
                Form: {df}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[200px]"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Manufacturer Filter */}
          <select
            value={selectedManufacturer}
            onChange={(e) => {
              setSelectedManufacturer(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[200px]"
          >
            <option value="All">All Manufacturers</option>
            {manufacturers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as "All" | "Active" | "Inactive");
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>

          {(searchQuery || selectedCategory !== "All" || selectedManufacturer !== "All" || selectedForm !== "All" || statusFilter !== "All" || stockFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedManufacturer("All");
                setSelectedForm("All");
                setStatusFilter("All");
                setStockFilter("all");
                setCurrentPage(1);
              }}
              className="text-emerald-700 hover:text-emerald-800 font-medium text-xs ml-auto hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Medicines Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">Medicine & Strength</th>
                <th className="py-3 px-4">Generic Name</th>
                <th className="py-3 px-4">Form</th>
                <th className="py-3 px-4">Active Batch & Expiry</th>
                <th className="py-3 px-4">Manufacturer</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedMedicines.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Pill className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">
                      No medicines found
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Try adjusting your search or filter settings
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedMedicines.map((med) => {
                  const isOutOfStock = med.currentStock <= 0;
                  const isLowStock = med.currentStock > 0 && med.currentStock <= med.minStockAlert;
                  const activeBatch = getEarliestDispensingBatch(med.batches);
                  const batchAnalysis = activeBatch ? getBatchAnalysis(activeBatch.expiryDate) : null;

                  return (
                    <tr
                      key={med.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{med.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {med.strength} • {med.shelfLocation || "Rack N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium max-w-[170px] truncate">
                        {med.genericName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {med.dosageForm}
                        </span>
                      </td>

                      {/* Active Batch & Expiry Column */}
                      <td className="py-3 px-4">
                        {activeBatch ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-800 text-[11px]">
                                {activeBatch.batchNumber}
                              </span>
                              {(med.batches?.length || 0) > 1 && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-500 font-mono">
                                  +{med.batches!.length - 1}
                                </span>
                              )}
                            </div>
                            {batchAnalysis && (
                              <span
                                className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-medium border ${batchAnalysis.badgeClass}`}
                              >
                                {batchAnalysis.label}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">No batch</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-[150px] truncate">
                        {med.manufacturer}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(med.sellingPrice)}
                        <span className="text-[10px] text-slate-400 block -mt-0.5 font-sans font-normal">
                          per {med.unit}
                        </span>
                      </td>

                      {/* Stock Level with Quick Restock Action */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          {isOutOfStock ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              0 {med.unit}s (Out)
                            </span>
                          ) : isLowStock ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              {med.currentStock} {med.unit}s (Low)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {med.currentStock} {med.unit}s
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenRestock(med)}
                            className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-0.5 cursor-pointer"
                            title="Add newly arrived batch shipment"
                          >
                            <PackagePlus className="w-3 h-3 inline" />
                            <span>+ Restock</span>
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(med)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors cursor-pointer ${
                            med.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                          }`}
                          title="Click to toggle status"
                        >
                          {med.isActive ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(med)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            title="View Specifications & Batches"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(med)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Edit Medicine"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-slate-100">
          {paginatedMedicines.length === 0 ? (
            <div className="py-12 text-center text-slate-400 p-4">
              <Pill className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-700 text-sm">
                No medicines found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search or filter settings
              </p>
            </div>
          ) : (
            paginatedMedicines.map((med) => {
              const isOutOfStock = med.currentStock <= 0;
              const isLowStock = med.currentStock > 0 && med.currentStock <= med.minStockAlert;
              const activeBatch = getEarliestDispensingBatch(med.batches);
              const batchAnalysis = activeBatch ? getBatchAnalysis(activeBatch.expiryDate) : null;

              return (
                <div key={med.id} className="p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {med.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {med.genericName} • {med.strength}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {med.dosageForm}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(med)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                          med.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                        }`}
                      >
                        {med.isActive ? "Active" : "Inactive"}
                      </button>
                    </div>
                  </div>

                  {/* Batch, Expiry & Manufacturer */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700">{med.manufacturer}</span>
                    {activeBatch && (
                      <>
                        <span>•</span>
                        <span className="font-mono bg-slate-100 px-1 rounded text-slate-700">
                          B: {activeBatch.batchNumber}
                        </span>
                        {batchAnalysis && (
                          <span className={`px-1 rounded text-[10px] border ${batchAnalysis.badgeClass}`}>
                            {batchAnalysis.label}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Price & Stock & Actions Row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-mono font-bold text-slate-900">
                        {formatCurrency(med.sellingPrice)}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">/ {med.unit}</span>
                      <div className="mt-0.5">
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            Low: {med.currentStock} {med.unit}s
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Stock: {med.currentStock} {med.unit}s
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenRestock(med)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1"
                      >
                        <PackagePlus className="w-3.5 h-3.5" />
                        <span>Restock</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(med)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                        title="View specifications"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(med)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                        title="Edit medicine"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredMedicines.length === 0
                ? 0
                : (currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredMedicines.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {filteredMedicines.length}
            </span>{" "}
            medicines
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Medicine Modal */}
      <MedicineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedMedicine}
        mode={modalMode}
      />

      {/* Medicine Specifications & Batches Modal */}
      <MedicineDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        medicine={detailMedicine}
        onEdit={(med) => handleOpenEdit(med)}
      />

      {/* Professional Batch Restock Dialog */}
      <Modal
        isOpen={Boolean(restockMedicine)}
        onClose={() => setRestockMedicine(null)}
        title="Restock Batch Shipment"
        description={`Record newly received stock and batch details for ${restockMedicine?.name}`}
        maxWidth="max-w-md"
      >
        {restockMedicine && (
          <form onSubmit={handleRestockSubmit} className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Medicine:</span>
                <span className="font-bold text-slate-900">
                  {restockMedicine.name} ({restockMedicine.strength})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Manufacturer:</span>
                <span className="text-slate-700">{restockMedicine.manufacturer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Shelf Stock:</span>
                <span className="font-mono font-bold text-slate-900">
                  {restockMedicine.currentStock} {restockMedicine.unit}s
                </span>
              </div>
            </div>

            {/* Quantity Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Shipment Quantity ({restockMedicine.unit}s)
              </label>
              <input
                type="number"
                min="1"
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                placeholder="e.g. 50"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-[11px] text-slate-400">Presets:</span>
                {[20, 50, 100, 200].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRestockAmount(String(preset))}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs transition-colors"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Batch Number Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Manufacturer Batch No.
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRestockBatchNumber(generateBatchNumber(restockMedicine.manufacturer));
                  }}
                  className="text-[10px] font-semibold text-emerald-700 hover:underline flex items-center gap-0.5"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  Auto-Gen
                </button>
              </div>
              <input
                type="text"
                value={restockBatchNumber}
                onChange={(e) => setRestockBatchNumber(e.target.value)}
                placeholder="e.g. BX-2601"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                required
              />
            </div>

            {/* Expiry Date Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Batch Expiry Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={restockExpiryDate}
                  onChange={(e) => setRestockExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              {restockExpiryDate && (
                <p className="text-[11px] text-slate-500">
                  Expiry:{" "}
                  <strong className="text-slate-700">
                    {formatExpiryDate(restockExpiryDate)}
                  </strong>{" "}
                  ({getDaysRemaining(restockExpiryDate)} days from today)
                </p>
              )}
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              Updated Total Stock:{" "}
              <strong className="font-mono">
                {restockMedicine.currentStock + (parseInt(restockAmount, 10) || 0)} {restockMedicine.unit}s
              </strong>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setRestockMedicine(null)}
                className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRestocking}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-200 cursor-pointer"
              >
                {isRestocking ? "Saving Batch..." : "Confirm Shipment"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
