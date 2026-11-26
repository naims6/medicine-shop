"use client";

import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  CalendarRange,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import type { DateRange } from "@/components/shared/DateRangePicker";
import { useSalesTrend } from "@/hooks/dashboard/useSalesTrend";
import type { SalesTrend } from "@/types";

// ─── Skeleton heights for loading state ─────────────────────────────────────

const SKELETON_BAR_HEIGHTS = [
  "h-[55%]",
  "h-[75%]",
  "h-[45%]",
  "h-[85%]",
  "h-[60%]",
  "h-[70%]",
  "h-[50%]",
];

// ─── View mode type ──────────────────────────────────────────────────────────

export type ChartViewMode = "weekly" | "monthly" | "custom";

// ─── Props ───────────────────────────────────────────────────────────────────

interface SalesChartProps {
  trendDay: SalesTrend | null;
  trendMonth: SalesTrend | null;
  isLoading?: boolean;
  viewMode: ChartViewMode;
  onViewModeChange: (mode: ChartViewMode) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SalesChart({
  trendDay,
  trendMonth,
  isLoading,
  viewMode,
  onViewModeChange,
}: SalesChartProps) {
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  // Page state for navigating backward through preset-mode history
  const [dayPage, setDayPage] = useState(1);
  const [monthPage, setMonthPage] = useState(1);

  // Custom date range state
  const [customRange, setCustomRange] = useState<DateRange>({
    startDate: "",
    endDate: "",
  });

  // Extra pages fetched lazily when user navigates backward in preset modes
  const extraDay = useSalesTrend(
    dayPage > 1 ? { interval: "day", limit: 7, page: dayPage } : {},
  );
  const extraMonth = useSalesTrend(
    monthPage > 1 ? { interval: "month", limit: 12, page: monthPage } : {},
  );

  // Custom range query — only fires when in custom mode and both dates are set
  const customQuery = useSalesTrend(
    viewMode === "custom" && customRange.startDate && customRange.endDate
      ? {
          interval: "day",
          startDate: customRange.startDate,
          endDate: customRange.endDate,
        }
      : { enabled: false },
  );

  // Resolve active trend data for each mode
  const activeDayTrend = dayPage === 1 ? trendDay : (extraDay.data ?? null);
  const activeMonthTrend = monthPage === 1 ? trendMonth : (extraMonth.data ?? null);
  const activeCustomTrend = customQuery.data ?? null;

  const activeTrend =
    viewMode === "weekly"
      ? activeDayTrend
      : viewMode === "monthly"
      ? activeMonthTrend
      : activeCustomTrend;

  const activePage = viewMode === "weekly" ? dayPage : monthPage;
  const setActivePage = viewMode === "weekly" ? setDayPage : setMonthPage;

  const isExtraLoading =
    viewMode === "weekly"
      ? dayPage > 1 && extraDay.isLoading
      : monthPage > 1 && extraMonth.isLoading;

  const isCustomLoading = viewMode === "custom" && customQuery.isLoading;

  const showSkeleton = isLoading || isExtraLoading || isCustomLoading;

  const chartData = useMemo(
    () =>
      activeTrend?.points.map((p) => ({
        label: p.label,
        date: p.date,
        amount: p.amount,
        count: p.count,
      })) ?? [],
    [activeTrend],
  );

  const hasPrevious = activeTrend?.period.hasPrevious ?? false;
  const hasNext = activeTrend?.period.hasNext ?? false;

  // ── Custom range helpers ────────────────────────────────────────────────────

  const handleCustomRangeChange = (range: DateRange) => {
    setCustomRange(range);
  };

  const clearCustomRange = () => {
    setCustomRange({ startDate: "", endDate: "" });
  };

  const handleViewModeChange = (mode: ChartViewMode) => {
    onViewModeChange(mode);
    if (mode !== "custom") {
      // Don't clear the range so it's retained if they switch back
    }
  };

  // ── Custom range state: show picker or show summary ────────────────────────
  const hasCustomRange = customRange.startDate && customRange.endDate;

  // ── Period label ───────────────────────────────────────────────────────────
  const periodLabel = (() => {
    if (viewMode === "custom") {
      if (!hasCustomRange)
        return "Pick a start and end date to see the trend";
      if (activeTrend)
        return `${activeTrend.period.startDate} → ${activeTrend.period.endDate}`;
      return `${customRange.startDate} → ${customRange.endDate}`;
    }
    if (activeTrend)
      return `${activeTrend.period.startDate} → ${activeTrend.period.endDate}`;
    return viewMode === "weekly"
      ? "Daily breakdown for last 7 days"
      : "Monthly performance overview";
  })();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col h-full">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
            Sales Revenue Trend
          </h3>
          <p className="text-xs text-slate-500 truncate">{periodLabel}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Timeframe toggle */}
          <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs font-semibold">
            <button
              onClick={() => handleViewModeChange("weekly")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === "weekly"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => handleViewModeChange("monthly")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === "monthly"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => handleViewModeChange("custom")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === "custom"
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Custom date range"
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>Custom</span>
            </button>
          </div>

          {/* Chart type toggle */}
          <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs">
            <button
              onClick={() => setChartType("area")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                chartType === "area"
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Area chart"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                chartType === "bar"
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Bar chart"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Custom range picker bar ── */}
      {viewMode === "custom" && (
        <div className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
          <CalendarRange className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-[11px] font-semibold text-emerald-700 mr-1 shrink-0">
            Range:
          </span>
          <DateRangePicker
            value={customRange}
            onChange={handleCustomRangeChange}
            placeholder="Pick start & end date"
            className="flex-1"
          />
          {hasCustomRange && (
            <button
              onClick={clearCustomRange}
              className="p-1 rounded-md hover:bg-emerald-100 text-emerald-600 transition-colors shrink-0"
              title="Clear custom range"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ── Period summary ── */}
      {!showSkeleton && activeTrend && (
        <div className="flex items-center gap-4 mb-3 px-1">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
              Period Revenue
            </span>
            <span className="text-sm font-bold font-mono text-emerald-700">
              ৳
              {activeTrend.totalRevenue.toLocaleString("en-BD", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
              Orders
            </span>
            <span className="text-sm font-bold font-mono text-slate-700">
              {activeTrend.totalOrders}
            </span>
          </div>
          {viewMode === "custom" && hasCustomRange && (
            <>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Days in range
                </span>
                <span className="text-sm font-bold font-mono text-slate-700">
                  {activeTrend.points.length}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Empty state for custom mode without a range set ── */}
      {viewMode === "custom" && !hasCustomRange && !showSkeleton && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
          <CalendarRange className="w-10 h-10 text-slate-200" />
          <p className="text-sm font-semibold text-slate-500">
            Select a date range
          </p>
          <p className="text-xs text-center max-w-[200px]">
            Use the picker above to pick a start and end date, then view daily
            sales for that period.
          </p>
        </div>
      )}

      {/* ── Chart area ── */}
      {(viewMode !== "custom" || hasCustomRange) && (
        <div className="w-full h-56 sm:h-64 mt-1">
          {showSkeleton ? (
            <div className="w-full h-full flex items-end gap-1.5 px-1 pb-1">
              {SKELETON_BAR_HEIGHTS.map((h, i) => (
                <Skeleton
                  key={i}
                  className={`flex-1 rounded-t rounded-b-none ${h}`}
                />
              ))}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "area" ? (
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="emeraldGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#059669"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#059669"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `৳${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderColor: "#e2e8f0",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [
                      `৳${Number(value).toFixed(2)}`,
                      "Revenue",
                    ]}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#emeraldGrad)"
                  />
                </AreaChart>
              ) : (
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `৳${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderColor: "#e2e8f0",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [
                      `৳${Number(value).toFixed(2)}`,
                      "Revenue",
                    ]}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#059669"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* ── Pagination (only for preset modes) ── */}
      {!showSkeleton &&
        viewMode !== "custom" &&
        (hasPrevious || hasNext) && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
            <button
              onClick={() => setActivePage((p) => p + 1)}
              disabled={!hasPrevious}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Older
            </button>
            <span className="text-slate-400 font-mono text-[11px]">
              Page {activePage}
            </span>
            <button
              onClick={() => setActivePage((p) => Math.max(1, p - 1))}
              disabled={!hasNext}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold cursor-pointer"
            >
              Newer
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
    </div>
  );
}
