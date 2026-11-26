"use client";

import { useState, useCallback } from "react";
import type { Sale, PaymentMethod } from "@/types";
import { useSales } from "@/hooks/sales/useSales";
import { salesService } from "@/services/sales.service";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import type { DateRange } from "@/components/shared/DateRangePicker";
import {
  Search,
  Filter,
  Printer,
  Eye,
  FileText,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Banknote,
  CircleDollarSign,
  X,
  RotateCcw,
  HandCoins,
  User,
  Loader2,
} from "lucide-react";
import { ReceiptModal } from "@/components/pos/ReceiptModal";
import { ReturnModal } from "@/components/returns/ReturnModal";
import { ReturnReceiptModal } from "@/components/returns/ReturnReceiptModal";
import { CollectDueModal } from "@/components/pos/CollectDueModal";
import { useQueryClient } from "@tanstack/react-query";

const PAYMENT_METHODS: (PaymentMethod | "All")[] = ["All", "Cash", "Owing"];
const ITEMS_PER_PAGE = 15;

// ─── helpers ────────────────────────────────────────────────────────────────

function getPaymentBadge(method: PaymentMethod) {
  if (method === "Cash")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <Banknote className="w-3 h-3" /> Cash
      </span>
    );
  if (method === "Owing")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <CircleDollarSign className="w-3 h-3" /> Owing
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
      <Banknote className="w-3 h-3" /> {method}
    </span>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function SalesHistoryPage() {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | "All">(
    "All",
  );
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState(1);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [returnTargetSale, setReturnTargetSale] = useState<Sale | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [completedReturn, setCompletedReturn] = useState<
    import("@/types").Return | null
  >(null);
  const [isReturnReceiptOpen, setIsReturnReceiptOpen] = useState(false);
  const [collectDueTargetSale, setCollectDueTargetSale] = useState<Sale | null>(
    null,
  );
  const [isCollectDueOpen, setIsCollectDueOpen] = useState(false);

  const queryClient = useQueryClient();

  // ── Debounce search ───────────────────────────────────────────────────────
  const [searchTimer, setSearchTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const handleSearchChange = useCallback(
    (v: string) => {
      setSearchQuery(v);
      if (searchTimer) clearTimeout(searchTimer);
      const t = setTimeout(() => {
        setDebouncedSearch(v);
        setPage(1);
      }, 350);
      setSearchTimer(t);
    },
    [searchTimer],
  );

  // ── API query ─────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useSales({
    page,
    limit: ITEMS_PER_PAGE,
    query: debouncedSearch || undefined,
    paymentMethod: selectedPayment !== "All" ? selectedPayment : undefined,
    startDate: dateRange.startDate || undefined,
    endDate: dateRange.endDate || undefined,
  });

  const sales = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const totalCount = meta?.total ?? 0;

  // ── Date range change ─────────────────────────────────────────────────────
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    setPage(1);
  };

  // ── Collect due ───────────────────────────────────────────────────────────
  const handleDueCollected = async (updatedSale: Sale) => {
    // Invalidate so the list refreshes with the updated due status
    await queryClient.invalidateQueries({ queryKey: ["sales"] });
    if (selectedSale?.id === updatedSale.id) setSelectedSale(updatedSale);
  };

  // ── Collect due via API ───────────────────────────────────────────────────
  const handleCollectDueAPI = async (
    saleId: string,
    paymentAmount: number,
    notes?: string,
  ) => {
    const updated = await salesService.collectDue(saleId, paymentAmount, notes);
    await handleDueCollected(updated);
    return updated;
  };

  // ── Active filter count indicator ─────────────────────────────────────────
  const activeFilters =
    (debouncedSearch ? 1 : 0) +
    (selectedPayment !== "All" ? 1 : 0) +
    (dateRange.startDate || dateRange.endDate ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedPayment("All");
    setDateRange({ startDate: "", endDate: "" });
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* ── Filter and Search Bar ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search invoice, customer, phone, cashier…"
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* DateRangePicker */}
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            placeholder="All time"
          />
        </div>

        {/* Payment Method filter + loading + reset */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-500 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">
              Filters:
            </span>
          </div>

          <select
            value={selectedPayment}
            onChange={(e) => {
              setSelectedPayment(e.target.value as PaymentMethod | "All");
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>
                Payment: {pm}
              </option>
            ))}
          </select>

          {/* Loading indicator */}
          {isFetching && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <Loader2 className="w-3 h-3 animate-spin" />
              Updating…
            </span>
          )}

          {activeFilters > 0 && (
            <button
              onClick={resetFilters}
              className="text-[11px] text-rose-600 hover:underline ml-auto font-medium flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Reset {activeFilters} filter{activeFilters > 1 ? "s" : ""}
            </button>
          )}
        </div>
      </div>

      {/* ── Summary strip (shown when a date range is active) ── */}
      {(dateRange.startDate || dateRange.endDate) && meta && !isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Invoices in range
            </span>
            <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {totalCount}
            </p>
            <span className="text-[11px] text-slate-400">
              Matching transactions
            </span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Date window
            </span>
            <p className="text-sm font-bold text-emerald-700 mt-0.5 truncate">
              {dateRange.startDate &&
                new Date(dateRange.startDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              {dateRange.startDate && dateRange.endDate && " – "}
              {dateRange.endDate &&
                new Date(dateRange.endDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
            </p>
            <span className="text-[11px] text-slate-400">Selected period</span>
          </div>
        </div>
      )}

      {/* ── Sales Table ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Cashier</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Net Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="h-3.5 bg-slate-100 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">
                      No sales found
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Try adjusting your filters or date range
                    </p>
                  </td>
                </tr>
              ) : (
                sales.map((sale) => {
                  const due =
                    typeof sale.dueAmount === "number" ? sale.dueAmount : 0;
                  const hasDue = due > 0;

                  return (
                    <tr
                      key={sale.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 block">
                          {sale.invoiceNumber}
                        </span>
                        {sale.customerName && (
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-800 mt-0.5">
                            <User className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>{sale.customerName}</span>
                            {sale.customerPhone && (
                              <span className="text-slate-500 font-normal">
                                ({sale.customerPhone})
                              </span>
                            )}
                          </div>
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
                          {sale.totalItems} pcs ({sale.items.length})
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
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
                        {hasDue && (
                          <div className="text-[10px] text-amber-700 font-extrabold mt-0.5">
                            Due: ৳{due.toFixed(2)}
                            <span className="block text-[9px] text-slate-400 font-normal">
                              Paid: ৳{(sale.amountReceived || 0).toFixed(2)}
                            </span>
                          </div>
                        )}
                        {!hasDue &&
                          sale.dueStatus === "cleared" &&
                          sale.customerName && (
                            <div className="text-[9px] text-emerald-600 font-medium mt-0.5">
                              ✓ Fully settled
                            </div>
                          )}
                        {sale.discountAmount > 0 && (
                          <span className="text-[10px] text-emerald-600 block">
                            Saved {formatCurrency(sale.discountAmount)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {hasDue ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            Owing
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {hasDue && (
                            <button
                              onClick={() => {
                                setCollectDueTargetSale(sale);
                                setIsCollectDueOpen(true);
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors text-[11px] font-bold shadow-xs cursor-pointer"
                            >
                              <HandCoins className="w-3.5 h-3.5" />
                              <span>Collect Due</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setReturnTargetSale(sale);
                              setIsReturnModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md border border-rose-200 transition-colors text-[11px] font-medium cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                            <span>Return</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSale(sale);
                              setIsReceiptOpen(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 transition-colors text-[11px] font-medium cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSale(sale);
                              setIsReceiptOpen(true);
                            }}
                            className="p-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 rounded-md border border-slate-200 transition-colors cursor-pointer"
                            title="Reprint Receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
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

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3.5 space-y-2 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))
          ) : sales.length === 0 ? (
            <div className="py-12 text-center p-4">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-700 text-sm">
                No sales found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting filters
              </p>
            </div>
          ) : (
            sales.map((sale) => {
              const due =
                typeof sale.dueAmount === "number" ? sale.dueAmount : 0;
              const hasDue = due > 0;

              return (
                <div key={sale.id} className="p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-slate-900 text-sm block">
                        {sale.invoiceNumber}
                      </span>
                      {sale.customerName && (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-800 mt-0.5">
                          <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{sale.customerName}</span>
                          {sale.customerPhone && (
                            <span className="text-slate-500 font-normal text-[11px]">
                              ({sale.customerPhone})
                            </span>
                          )}
                        </div>
                      )}
                      <span className="text-[11px] text-slate-500 font-mono">
                        {formatDateTime(sale.createdAt)}
                      </span>
                    </div>
                    {getPaymentBadge(sale.paymentMethod)}
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="font-semibold">
                      {sale.totalItems} items:{" "}
                    </span>
                    <span className="text-slate-500">
                      {sale.items
                        .map((i) => `${i.name} ×${i.quantity}`)
                        .join(", ")}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-base font-mono font-bold text-slate-900">
                        {formatCurrency(sale.totalAmount)}
                      </span>
                      {hasDue && (
                        <div className="text-xs text-amber-800 font-extrabold">
                          Due: ৳{due.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {hasDue && (
                        <button
                          onClick={() => {
                            setCollectDueTargetSale(sale);
                            setIsCollectDueOpen(true);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                        >
                          <HandCoins className="w-3.5 h-3.5" />
                          <span>Collect</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedSale(sale);
                          setIsReceiptOpen(true);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => {
                          setReturnTargetSale(sale);
                          setIsReturnModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold border border-rose-200 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Return</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination footer */}
        {!isLoading && meta && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {totalCount === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-700">
                {Math.min(page * ITEMS_PER_PAGE, totalCount)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">{totalCount}</span>{" "}
              invoices
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={`p-1.5 rounded-md border border-slate-200 ${
                  page <= 1
                    ? "text-slate-300 cursor-not-allowed bg-slate-50"
                    : "text-slate-700 hover:bg-slate-100 bg-white"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className={`p-1.5 rounded-md border border-slate-200 ${
                  page >= totalPages
                    ? "text-slate-300 cursor-not-allowed bg-slate-50"
                    : "text-slate-700 hover:bg-slate-100 bg-white"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={selectedSale}
      />
      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setReturnTargetSale(null);
        }}
        onReturnComplete={(ret) => {
          setCompletedReturn(ret);
          setIsReturnReceiptOpen(true);
        }}
        preloadedSale={returnTargetSale}
      />
      <ReturnReceiptModal
        isOpen={isReturnReceiptOpen}
        onClose={() => setIsReturnReceiptOpen(false)}
        returnData={completedReturn}
      />
      <CollectDueModal
        isOpen={isCollectDueOpen}
        onClose={() => {
          setIsCollectDueOpen(false);
          setCollectDueTargetSale(null);
        }}
        sale={collectDueTargetSale}
        onDueCollected={handleDueCollected}
      />
    </div>
  );
}
