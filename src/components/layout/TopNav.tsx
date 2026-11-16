"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  Clock,
  RotateCcw,
  Sparkles,
  Command,
  CheckCircle,
} from "lucide-react";
import { medicineRepository } from "@/repositories/medicineRepository";
import { salesRepository } from "@/repositories/salesRepository";

const titleMap: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Dashboard",
    subtitle: "Real-time sales performance & pharmacy overview",
  },
  "/pos": {
    title: "Point of Sale (POS)",
    subtitle: "Fast medicine billing & receipt checkout",
  },
  "/medicines": {
    title: "Medicine Catalogue",
    subtitle: "Manage drugs, dosages, pricing & availability",
  },
  "/sales": {
    title: "Sales History",
    subtitle: "Complete audit log, invoice search & reprinting",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Pharmacy profile, tax configuration & preferences",
  },
};

interface TopNavProps {
  onToggleMobileSidebar: () => void;
}

export function TopNav({ onToggleMobileSidebar }: TopNavProps) {
  const pathname = usePathname();
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [isResetting, setIsResetting] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }) + " • " + now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setCurrentDateTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const meta = titleMap[pathname] || {
    title: "PharmaCare POS",
    subtitle: "Medicine Shop Management",
  };

  const handleResetData = async () => {
    if (confirm("Reset demo data to initial sample medicines & sales?")) {
      setIsResetting(true);
      await medicineRepository.resetToDefault();
      await salesRepository.resetToDefault();
      localStorage.removeItem("pharmacare_pos_cart_v1");
      setShowResetSuccess(true);
      setTimeout(() => {
        setIsResetting(false);
        window.location.reload();
      }, 600);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base md:text-lg font-bold text-slate-900 leading-tight">
            {meta.title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {meta.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Keyboard shortcuts hint */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
          <Command className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 font-semibold text-[11px]">F2</span>
          <span>Find Drug</span>
          <span className="mx-1 text-slate-300">|</span>
          <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 font-semibold text-[11px]">F4</span>
          <span>Pay</span>
        </div>

        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium font-mono">{currentDateTime || "Loading..."}</span>
        </div>

        {/* Store badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>Dhanmondi Branch</span>
        </div>

        {/* Reset Demo Data button */}
        <button
          onClick={handleResetData}
          disabled={isResetting}
          title="Reset demo data to initial defaults"
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          {showResetSuccess ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline text-emerald-700">Reset Done</span>
            </>
          ) : (
            <>
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin text-emerald-600" : "text-slate-400"}`} />
              <span className="hidden sm:inline">Reset Demo</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
