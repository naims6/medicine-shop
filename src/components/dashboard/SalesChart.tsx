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
import { BarChart3, TrendingUp } from "lucide-react";

interface SalesChartProps {
  weeklyData: { day: string; date: string; amount: number; count: number }[];
  monthlyData: { month: string; amount: number; count: number }[];
}

export function SalesChart({ weeklyData, monthlyData }: SalesChartProps) {
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  const chartData = useMemo(() => {
    if (viewMode === "weekly") {
      return weeklyData.map((d) => ({
        label: d.day,
        date: d.date,
        amount: d.amount,
        count: d.count,
      }));
    } else {
      return monthlyData.map((d) => ({
        label: d.month,
        date: d.month,
        amount: d.amount,
        count: d.count,
      }));
    }
  }, [viewMode, weeklyData, monthlyData]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col h-full">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Sales Revenue Trends</span>
          </h3>
          <p className="text-xs text-slate-500">
            {viewMode === "weekly"
              ? "Daily breakdown for the last 7 days"
              : "Monthly performance overview"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe switch */}
          <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs font-semibold">
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === "weekly"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === "monthly"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Monthly
            </button>
          </div>

          {/* Area vs Bar */}
          <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs">
            <button
              onClick={() => setChartType("area")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                chartType === "area"
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Area Curve"
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
              title="Bar Chart"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="w-full h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
                tickFormatter={(val) => `৳${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e2e8f0",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
                formatter={(value) => [`৳${Number(value).toFixed(2)}`, "Revenue"]}
                labelFormatter={(label) => `Period: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#emeraldGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
                tickFormatter={(val) => `৳${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e2e8f0",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                }}
                formatter={(value) => [`৳${Number(value).toFixed(2)}`, "Revenue"]}
              />
              <Bar dataKey="amount" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
