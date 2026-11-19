"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { salesRepository } from "@/repositories/salesRepository";
import { DashboardMetrics, Sale } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Pill,
  ArrowRight,
  Receipt,
  ShoppingCart,
  Calendar,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { ReceiptModal } from "@/components/pos/ReceiptModal";

type TimeRange = "today" | "7days" | "30days" | "all";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [selectedRange, setSelectedRange] = useState<TimeRange>("today");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Sale | null>(null);

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
            Showing performance metrics for:{" "}
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

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Sales Revenue
            </span>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {isLoading ? "..." : formatCurrency(metrics?.totalRevenue || 0)}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>{rangeLabels[selectedRange]}</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Transactions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Transactions
            </span>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {isLoading ? "..." : metrics?.totalTransactions || 0}
            </p>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Completed cash memos
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Avg Basket Value */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Average Ticket
            </span>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {isLoading
                ? "..."
                : formatCurrency(metrics?.averageTransactionValue || 0)}
            </p>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Per customer receipt
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Medicines Sold */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Medicines Dispensed
            </span>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {isLoading ? "..." : `${metrics?.totalMedicinesSold || 0} pcs`}
            </p>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              Total dosage units sold
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
            <Pill className="w-6 h-6" />
          </div>
        </div>
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

      {/* Bottom: Recent Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
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

        <div className="overflow-x-auto">
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
                      className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors"
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

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        sale={selectedReceipt}
      />
    </div>
  );
}
