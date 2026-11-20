"use client";

import { useState, useEffect, useMemo } from "react";
import { Return, PaymentMethod } from "@/types";
import { returnRepository } from "@/repositories/returnRepository";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  Search,
  Filter,
  Calendar,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Banknote,
  CircleDollarSign,
  X,
  Plus,
} from "lucide-react";
import { ReturnModal } from "@/components/returns/ReturnModal";
import { ReturnReceiptModal } from "@/components/returns/ReturnReceiptModal";

const refundMethods: (PaymentMethod | "All")[] = [
  "All",
  "Cash",
  "Owing",
];

const ITEMS_PER_PAGE = 8;

export default function ReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRefundMethod, setSelectedRefundMethod] = useState<
    PaymentMethod | "All"
  >("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const loadReturns = () => {
    returnRepository.getAll().then((all) => {
      setReturns(all);
    });
  };

  useEffect(() => {
    loadReturns();
  }, []);

  // Filtered returns
  const filteredReturns = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return returns.filter((r) => {
      if (
        selectedRefundMethod !== "All" &&
        r.refundMethod !== selectedRefundMethod
      ) {
        return false;
      }
      if (startDate) {
        const rTime = new Date(r.createdAt).setHours(0, 0, 0, 0);
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        if (rTime < start) return false;
      }
      if (endDate) {
        const rTime = new Date(r.createdAt).setHours(23, 59, 59, 999);
        const end = new Date(endDate).setHours(23, 59, 59, 999);
        if (rTime > end) return false;
      }
      if (!q) return true;

      return (
        r.returnNumber.toLowerCase().includes(q) ||
        r.originalInvoiceNumber.toLowerCase().includes(q) ||
        r.processedBy.toLowerCase().includes(q) ||
        r.items.some(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.genericName.toLowerCase().includes(q)
        )
      );
    });
  }, [returns, searchQuery, selectedRefundMethod, startDate, endDate]);

  const totalPages = Math.ceil(filteredReturns.length / ITEMS_PER_PAGE) || 1;
  const paginatedReturns = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredReturns.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredReturns, currentPage]);

  const totalFilteredRefund = useMemo(() => {
    return filteredReturns.reduce((acc, r) => acc + r.totalRefundAmount, 0);
  }, [filteredReturns]);

  const handleReturnComplete = (ret: Return) => {
    setSelectedReturn(ret);
    setIsReceiptOpen(true);
    loadReturns();
  };

  const handleViewReceipt = (ret: Return) => {
    setSelectedReturn(ret);
    setIsReceiptOpen(true);
  };

  const getRefundBadge = (method: PaymentMethod) => {
    switch (method) {
      case "Cash":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Banknote className="w-3 h-3" /> Cash
          </span>
        );
      case "Owing":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <CircleDollarSign className="w-3 h-3" /> Owing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Banknote className="w-3 h-3" /> {method}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Returns
          </span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">
            {filteredReturns.length}
          </p>
          <span className="text-[11px] text-slate-400">
            Processed returns
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Refund Amount
          </span>
          <p className="text-xl font-bold font-mono text-rose-700 mt-0.5">
            {formatCurrency(totalFilteredRefund)}
          </p>
          <span className="text-[11px] text-slate-400">Refunded to customers</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Stock Restored
            </span>
            <p className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
              {filteredReturns.reduce((acc, r) => acc + r.totalItems, 0)} pcs
            </p>
            <span className="text-[11px] text-slate-400">Added back to inventory</span>
          </div>
          <button
            type="button"
            onClick={() => setIsReturnModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Return</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search return #, invoice #, cashier, or medicine..."
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

          {/* Quick Date Shortcuts */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => {
                const today = new Date().toISOString().split("T")[0];
                setStartDate(today);
                setEndDate(today);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              Today
            </button>
            <button
              onClick={() => {
                const now = new Date();
                const past = new Date();
                past.setDate(now.getDate() - 7);
                setStartDate(past.toISOString().split("T")[0]);
                setEndDate(now.toISOString().split("T")[0]);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              All Time
            </button>
          </div>
        </div>

        {/* Detailed Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-500 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">
              Filters:
            </span>
          </div>

          <select
            value={selectedRefundMethod}
            onChange={(e) => {
              setSelectedRefundMethod(
                e.target.value as PaymentMethod | "All"
              );
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {refundMethods.map((pm) => (
              <option key={pm} value={pm}>
                Refund: {pm}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-700 focus:outline-none"
            />
            <span className="text-[11px] text-slate-400">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-slate-700 focus:outline-none"
            />
          </div>

          {(searchQuery ||
            selectedRefundMethod !== "All" ||
            startDate ||
            endDate) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedRefundMethod("All");
                setStartDate("");
                setEndDate("");
                setCurrentPage(1);
              }}
              className="text-[11px] text-rose-600 hover:underline ml-auto font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Returns Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">Return #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Original Invoice</th>
                <th className="py-3 px-4">Items Returned</th>
                <th className="py-3 px-4">Refund Method</th>
                <th className="py-3 px-4 text-right">Refund Amount</th>
                <th className="py-3 px-4">Processed By</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedReturns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">
                      No returns found
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {returns.length === 0
                        ? "No returns have been processed yet"
                        : "Try adjusting your filters"}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedReturns.map((ret) => (
                  <tr
                    key={ret.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 block">
                        {ret.returnNumber}
                      </span>
                      {ret.notes && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[150px] block">
                          {ret.notes}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {formatDateTime(ret.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-700">
                        {ret.originalInvoiceNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-900 font-medium">
                        {ret.totalItems} pcs ({ret.items.length}{" "}
                        {ret.items.length === 1 ? "medicine" : "medicines"})
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                        {ret.items.map((i) => i.name).join(", ")}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getRefundBadge(ret.refundMethod)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono font-bold text-rose-700 text-sm">
                        {formatCurrency(ret.totalRefundAmount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {ret.processedBy}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleViewReceipt(ret)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 transition-colors text-[11px] font-medium cursor-pointer ml-auto"
                        title="View Return Memo"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-slate-100">
          {paginatedReturns.length === 0 ? (
            <div className="py-12 text-center text-slate-400 p-4">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-700 text-sm">
                No returns found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {returns.length === 0
                  ? "No returns have been processed yet"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            paginatedReturns.map((ret) => (
              <div key={ret.id} className="p-3.5 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-slate-900 text-sm block">
                      {ret.returnNumber}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {formatDateTime(ret.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getRefundBadge(ret.refundMethod)}
                  </div>
                </div>

                <div className="text-xs text-slate-600">
                  <span className="font-semibold">Invoice: </span>
                  <span className="font-mono text-blue-700">
                    {ret.originalInvoiceNumber}
                  </span>
                  <span className="mx-1.5">•</span>
                  <span>
                    {ret.totalItems} items:{" "}
                    {ret.items
                      .map((i) => `${i.name} (x${i.quantity})`)
                      .join(", ")}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-base font-mono font-bold text-rose-700">
                      {formatCurrency(ret.totalRefundAmount)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Refunded
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleViewReceipt(ret)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>View Memo</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredReturns.length === 0
                ? 0
                : (currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredReturns.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {filteredReturns.length}
            </span>{" "}
            returns
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className={`p-1.5 rounded-md border border-slate-200 ${
                currentPage <= 1
                  ? "text-slate-300 cursor-not-allowed bg-slate-50"
                  : "text-slate-700 hover:bg-slate-100 bg-white"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage >= totalPages}
              className={`p-1.5 rounded-md border border-slate-200 ${
                currentPage >= totalPages
                  ? "text-slate-300 cursor-not-allowed bg-slate-50"
                  : "text-slate-700 hover:bg-slate-100 bg-white"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Return Processing Modal */}
      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onReturnComplete={handleReturnComplete}
      />

      {/* Return Receipt Modal */}
      <ReturnReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        returnData={selectedReturn}
      />
    </div>
  );
}
