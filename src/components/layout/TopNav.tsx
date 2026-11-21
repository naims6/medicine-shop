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
import { userRepository } from "@/repositories/userRepository";
import { initialUsers } from "@/data/mockUsers";
import { useAuth } from "@/stores/AuthContext";

function getInitials(name: string): string {
  if (!name) return "AD";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  const titles = ["dr.", "mr.", "mrs.", "md.", "ms."];
  if (titles.includes(parts[0].toLowerCase()) && parts.length > 1) {
    if (parts.length > 2) {
      return (parts[1][0] + parts[2][0]).toUpperCase();
    }
    return parts[1].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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
  "/dashboard/returns": {
    title: "Sales Returns & Refunds",
    subtitle: "Process medicine returns & inventory restock",
  },
  "/dashboard/users": {
    title: "User Management",
    subtitle: "Staff accounts, salesman credentials & admin permissions",
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
    title: "Shodesh Pharmacy POS",
    subtitle: "Pharmacy Management",
  };

  const handleResetData = async () => {
    if (confirm("Reset demo data to initial sample medicines, sales & 5 fake users?")) {
      setIsResetting(true);
      await medicineRepository.resetToDefault();
      await salesRepository.resetToDefault();
      await userRepository.resetToDefault();
      localStorage.removeItem("pharmacare_pos_cart_v1");
      localStorage.setItem("pharmacare_auth_session_v1", JSON.stringify(initialUsers[0]));
      sessionStorage.removeItem("pharmacare_explicit_logout");
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

  const currentUser = user || initialUsers[0];
  const displayName = currentUser?.name || "Dr. Tanvir Ahmed";
  const displayRole = currentUser?.role || "Admin";

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-4 md:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 shrink-0"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 leading-tight truncate">
            {meta.title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block truncate">
            {meta.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-medium font-mono">
            {currentDateTime || "Loading..."}
          </span>
        </div>

        {/* Reset Demo Data button */}
        <button
          onClick={handleResetData}
          disabled={isResetting}
          title="Reset demo data to initial defaults"
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-2 sm:px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
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
              <span className="hidden sm:inline">Reset</span>
            </>
          )}
        </button>

        <div className="h-5 w-px bg-slate-200" />

        {/* Admin / User Profile */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 select-none">
            {getInitials(displayName)}
          </div>
          <div className="flex flex-col text-left">
            <span
              className="text-xs font-semibold text-slate-800 leading-tight max-w-[85px] sm:max-w-[140px] md:max-w-[170px] truncate"
              title={displayName}
            >
              {displayName}
            </span>
            <span className="text-[10px] text-slate-500 font-medium capitalize leading-tight">
              {displayRole}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 text-xs font-medium transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
