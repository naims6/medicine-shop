"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Clock,
  RotateCcw,
  CheckCircle,
  LogOut,
} from "lucide-react";
import { medicineRepository } from "@/repositories/medicineRepository";
import { salesRepository } from "@/repositories/salesRepository";
import { useAuth } from "@/stores/AuthContext";

const titleMap: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Sales performance & pharmacy overview",
  },
  "/dashboard/pos": {
    title: "Point of Sale (POS)",
    subtitle: "Fast billing & customer receipts",
  },
  "/dashboard/medicines": {
    title: "Medicine Catalogue",
    subtitle: "Manage drugs, dosages & pricing",
  },
  "/dashboard/sales": {
    title: "Sales History",
    subtitle: "Invoices, transactions & records",
  },
  "/dashboard/settings": {
    title: "Settings",
    subtitle: "Pharmacy store preferences",
  },
};

interface TopNavProps {
  onToggleMobileSidebar: () => void;
}

export function TopNav({ onToggleMobileSidebar }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [isResetting, setIsResetting] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted =
        now.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        }) +
        " • " +
        now.toLocaleTimeString("en-US", {
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
    subtitle: "Pharmacy Management",
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

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await logout();
      router.replace("/login");
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
        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium font-mono">
            {currentDateTime || "Loading..."}
          </span>
        </div>

        {/* User Status / Quick Logout */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {user.name.split(" ")[0]}
              </span>
              <span className="text-[10px] text-slate-500 capitalize">
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
              <span className="hidden sm:inline text-emerald-700">
                Reset Done
              </span>
            </>
          ) : (
            <>
              <RotateCcw
                className={`w-3.5 h-3.5 ${isResetting ? "animate-spin text-emerald-600" : "text-slate-400"}`}
              />
              <span className="hidden sm:inline">Reset Demo</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
