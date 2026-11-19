"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { salesRepository } from "@/repositories/salesRepository";
import { DashboardMetrics, Sale } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { formatExpiryDate } from "@/lib/expiryUtils";
import {
  DollarSign,
  ShoppingBag,
  Pill,
  ArrowRight,
  Receipt,
  ShoppingCart,
  Calendar,
  Eye,
  CheckCircle2,
  AlertTriangle,
  PackagePlus,
  Clock,
  Layers,
} from "lucide-react";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { ReceiptModal } from "@/components/pos/ReceiptModal";

type TimeRange = "today" | "7days" | "30days" | "all";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>("today");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Sale | null>(null);
  const [alertTab, setAlertTab] = useState<"reorder" | "expiry">("reorder");

  useEffect(() => {
    let isMounted = true;
    salesRepository.getDashboardMetrics(selectedRange).then((data) => {
      if (isMounted) {
        setMetrics(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedRange]);

  const rangeLabels: Record<TimeRange, string> = {
    today: "Today",
    "7days": "Last 7 Days",
    "30days": "Last 30 Days",
    all: "All Time",
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Top Banner with Time Filter and POS Quick Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Pharmacy Sales Overview
          </h2>
          <p className="text-xs text-slate-500">
            Performance metrics for:{" "}
            <span className="font-semibold text-slate-700">
              {rangeLabels[selectedRange]}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Time range selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1" />
            {(["today", "7days", "30days", "all"] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRange(r)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  selectedRange === r
                    ? "bg-white text-slate-900 font-bold shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {rangeLabels[r]}
              </button>
            ))}
          </div>

          {/* Quick POS Launch */}
          <Link
            href="/dashboard/pos"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shadow-emerald-200 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>New Sale</span>
          </Link>
        </div>
      </div>

      {/* 6 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Revenue */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Revenue
            </span>
            <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
              {isLoading ? "..." : formatCurrency(metrics?.totalRevenue || 0)}
            </p>
            <span className="text-[10px] text-emerald-600 font-medium">
              Completed sales
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Transactions */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Transactions
            </span>
            <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
              {isLoading ? "..." : metrics?.totalTransactions || 0}
            </p>
            <span className="text-[10px] text-slate-400">Total bills memo</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Avg Sale */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Avg Ticket
            </span>
            <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
              {isLoading ? "..." : formatCurrency(metrics?.averageTransactionValue || 0)}
            </p>
            <span className="text-[10px] text-slate-400">Per receipt</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4: Medicines Sold */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Dispensed
            </span>
            <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
              {isLoading ? "..." : `${metrics?.totalMedicinesSold || 0} pcs`}
            </p>
            <span className="text-[10px] text-slate-400">Units sold</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <Pill className="w-4 h-4" />
          </div>
        </div>

        {/* Card 5: Low Stock Alert */}
        <Link
          href="/dashboard/medicines"
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 shadow-xs flex items-center justify-between transition-colors group cursor-pointer"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              Low Stock
            </span>
            <p className="text-lg font-bold font-mono text-amber-700 mt-0.5">
              {isLoading ? "..." : `${metrics?.lowStockCount || 0} items`}
            </p>
            <span className="text-[10px] text-amber-600 font-medium group-hover:underline">
              Reorder limit →
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <PackagePlus className="w-4 h-4" />
          </div>
        </Link>

        {/* Card 6: Expiry Alert (<90d) */}
        <Link
          href="/dashboard/medicines"
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-rose-400 shadow-xs flex items-center justify-between transition-colors group cursor-pointer"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1">
              <Clock className="w-3 h-3 text-rose-600" />
              Expiring Soon
            </span>
            <p className="text-lg font-bold font-mono text-rose-700 mt-0.5">
              {isLoading ? "..." : `${metrics?.expiringCount || 0} batches`}
            </p>
            <span className="text-[10px] text-rose-600 font-medium group-hover:underline">
              &lt;90 days watch →
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Middle Grid: Charts and Top-Selling Medicines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Chart (2 cols) */}
        <div className="lg:col-span-2">
          {metrics && (
            <SalesChart
              weeklyData={metrics.weeklySales}
              monthlyData={metrics.monthlySales}
            />
          )}
        </div>

        {/* Top Selling Medicines (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Top-Selling Medicines
              </h3>
              <p className="text-xs text-slate-500">Highest volume demand</p>
            </div>
            <Link
              href="/dashboard/medicines"
              className="text-xs text-emerald-700 hover:underline font-semibold"
            >
              Catalogue
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 space-y-2 mt-1">
            {metrics?.topSellingMedicines.map((med, index) => (
              <div
                key={med.medicineId}
                className="pt-2 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    #{index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {med.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {med.genericName} • {med.strength}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-900 block">
                    {med.totalQuantity} pcs
                  </span>
                  <span className="text-[10px] text-emerald-600 font-mono">
                    {formatCurrency(med.totalRevenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Inventory & Expiry Watch + Recent Completed Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Inventory Alert Watch Card (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            {/* Tabs for Reorder vs Expiry Watch */}
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setAlertTab("reorder")}
                className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors cursor-pointer ${
                  alertTab === "reorder"
                    ? "bg-amber-100 text-amber-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Reorder ({metrics?.lowStockCount || 0})
              </button>
              <button
                type="button"
                onClick={() => setAlertTab("expiry")}
                className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors cursor-pointer ${
                  alertTab === "expiry"
                    ? "bg-rose-100 text-rose-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Expiry Watch ({metrics?.expiringAlerts?.length || 0})
              </button>
            </div>

            <Link
              href="/dashboard/medicines"
              className="text-[11px] font-semibold text-emerald-700 hover:underline"
            >
              Catalogue →
            </Link>
          </div>

          <div className="p-4 flex-1 overflow-y-auto divide-y divide-slate-100 space-y-2 max-h-[360px]">
            {alertTab === "reorder" ? (
              !metrics?.lowStockMedicines || metrics.lowStockMedicines.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  All medicines are sufficiently stocked!
                </div>
              ) : (
                metrics.lowStockMedicines.slice(0, 6).map((med) => (
                  <div key={med.id} className="pt-2 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{med.name}</h5>
                      <p className="text-[11px] text-slate-500">
                        {med.strength} • {med.shelfLocation || "Rack N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-mono font-bold text-xs px-2 py-0.5 rounded-full ${
                          med.currentStock <= 0
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {med.currentStock} {med.unit}s
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        Alert at: {med.minStockAlert}
                      </span>
                    </div>
                  </div>
                ))
              )
            ) : (
              !metrics?.expiringAlerts || metrics.expiringAlerts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No batches near expiry (&lt;90 days)!
                </div>
              ) : (
                metrics.expiringAlerts.slice(0, 6).map((alert, idx) => (
                  <div key={idx} className="pt-2 flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">
                        {alert.medicineName}
                      </h5>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Batch: <span className="font-bold text-slate-700">{alert.batchNumber}</span> • Exp: {formatExpiryDate(alert.expiryDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded-full border ${
                          alert.status === "expired"
                            ? "bg-red-50 text-red-800 border-red-300"
                            : alert.status === "critical"
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {alert.status === "expired"
                          ? `Expired (${Math.abs(alert.daysRemaining)}d ago)`
                          : `Exp in ${alert.daysRemaining}d`}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                        {alert.stock} units
                      </span>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Recent Transactions Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Recent Completed Sales
              </h3>
              <p className="text-xs text-slate-500">
                Latest transactions recorded at this pharmacy
              </p>
            </div>

            <Link
              href="/dashboard/sales"
              className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              <span>View All Sales</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-4">Time</th>
                  <th className="py-2.5 px-4">Cashier</th>
                  <th className="py-2.5 px-4">Items</th>
                  <th className="py-2.5 px-4">Payment</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics?.recentTransactions.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                      {sale.invoiceNumber}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">
                      {formatDateTime(sale.createdAt)}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">{sale.cashierName}</td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {sale.totalItems} pcs ({sale.items.length} lines)
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-medium text-slate-700">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(sale.totalAmount)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(sale)}
                        className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        title="View Receipt"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        sale={selectedReceipt}
      />
    </div>
  );
}
