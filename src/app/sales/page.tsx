"use client";

import { useState, useEffect, useMemo } from "react";
import { Sale, PaymentMethod } from "@/types";
import { salesRepository } from "@/repositories/salesRepository";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  Search,
  Filter,
  Calendar,
  Printer,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Banknote,
  Smartphone,
  CircleDollarSign,
  X,
} from "lucide-react";
import { ReceiptModal } from "@/components/pos/ReceiptModal";

const paymentMethods: (PaymentMethod | "All")[] = [
  "All",
  "Cash",
  "bKash",
  "Nagad",
  "Card",
  "Other",
];

const ITEMS_PER_PAGE = 8;

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | "All">(
    "All",
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    salesRepository.getAll().then((all) => {
      if (isMounted) {
        setSales(all);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered sales
  const filteredSales = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return sales.filter((s) => {
      if (selectedPayment !== "All" && s.paymentMethod !== selectedPayment) {
        return false;
      }
      if (startDate) {
        const sTime = new Date(s.createdAt).setHours(0, 0, 0, 0);
        const start = new Date(startDate).setHours(0, 0, 0, 0);
        if (sTime < start) return false;
      }
      if (endDate) {
        const sTime = new Date(s.createdAt).setHours(23, 59, 59, 999);
        const end = new Date(endDate).setHours(23, 59, 59, 999);
        if (sTime > end) return false;
      }
      if (!q) return true;

      return (
        s.invoiceNumber.toLowerCase().includes(q) ||
        s.cashierName.toLowerCase().includes(q) ||
        s.items.some(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.genericName.toLowerCase().includes(q),
        )
      );
    });
  }, [sales, searchQuery, selectedPayment, startDate, endDate]);

  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE) || 1;
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSales.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSales, currentPage]);

  const totalFilteredRevenue = useMemo(() => {
    return filteredSales.reduce((acc, s) => acc + s.totalAmount, 0);
  }, [filteredSales]);

  const handleOpenReceipt = (sale: Sale) => {
    setSelectedSale(sale);
    setIsReceiptOpen(true);
  };

  const getPaymentBadge = (method: PaymentMethod) => {
    switch (method) {
      case "Cash":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Banknote className="w-3 h-3" /> Cash
          </span>
        );
      case "bKash":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-50 text-pink-700 border border-pink-200">
            <Smartphone className="w-3 h-3" /> bKash
          </span>
        );
      case "Nagad":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <Smartphone className="w-3 h-3" /> Nagad
          </span>
        );
      case "Card":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CreditCard className="w-3 h-3" /> Card
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <CircleDollarSign className="w-3 h-3" /> {method}
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
            Filtered Invoices
          </span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">
            {filteredSales.length}
          </p>
          <span className="text-[11px] text-slate-400">
            Total completed sales
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Filtered Revenue
          </span>
          <p className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
            {formatCurrency(totalFilteredRevenue)}
          </p>
          <span className="text-[11px] text-slate-400">Net collection</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Average Basket Value
          </span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">
            {formatCurrency(
              filteredSales.length > 0
                ? totalFilteredRevenue / filteredSales.length
                : 0,
            )}
          </p>
          <span className="text-[11px] text-slate-400">Per transaction</span>
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
              placeholder="Search invoice number, cashier, or medicine..."
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

        {/* Detailed Date Picker & Payment Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-500 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">
              Filters:
            </span>
          </div>

          {/* Payment Method Selector */}
          <select
            value={selectedPayment}
            onChange={(e) => {
              setSelectedPayment(e.target.value as PaymentMethod | "All");
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {paymentMethods.map((pm) => (
              <option key={pm} value={pm}>
                Payment: {pm}
              </option>
            ))}
          </select>

          {/* Date Range Inputs */}
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
            selectedPayment !== "All" ||
            startDate ||
            endDate) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedPayment("All");
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

      {/* Sales Invoices Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Cashier</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Net Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">
                      No sales transactions found
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Try adjusting your filters or date selection
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 block">
                        {sale.invoiceNumber}
                      </span>
                      {sale.notes && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[150px] block">
                          Ref: {sale.notes}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {formatDateTime(sale.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {sale.cashierName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-900 font-medium">
                        {sale.totalItems} pcs ({sale.items.length} medicines)
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                        {sale.items.map((i) => i.name).join(", ")}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getPaymentBadge(sale.paymentMethod)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {formatCurrency(sale.totalAmount)}
                      </span>
                      {sale.discountAmount > 0 && (
                        <span className="text-[10px] text-emerald-600 block -mt-0.5">
                          Saved {formatCurrency(sale.discountAmount)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Completed
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenReceipt(sale)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 transition-colors text-[11px] font-medium cursor-pointer"
                          title="View & Print Invoice Memo"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleOpenReceipt(sale)}
                          className="p-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 rounded-md border border-slate-200 transition-colors cursor-pointer"
                          title="Reprint Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredSales.length === 0
                ? 0
                : (currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-700">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredSales.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {filteredSales.length}
            </span>{" "}
            invoices
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={selectedSale}
      />
    </div>
  );
}
