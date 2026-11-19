"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Pill,
  History,
  Settings,
  Store,
  ChevronRight,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { useCart } from "@/stores/CartContext";
import { useAuth } from "@/stores/AuthContext";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "New Sale (POS)",
    href: "/dashboard/pos",
    icon: ShoppingCart,
    isPOS: true,
  },
  {
    name: "Medicines",
    href: "/dashboard/medicines",
    icon: Pill,
    badge: null,
  },
  {
    name: "Sales History",
    href: "/dashboard/sales",
    icon: History,
    badge: null,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    badge: null,
  },
];

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalQuantity } = useCart();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out of the POS terminal?")) {
      await logout();
      router.replace("/login");
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-200 gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
          <Store className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 tracking-tight text-base flex items-center gap-1.5">
            PharmaCare <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">POS</span>
          </span>
          <span className="text-xs text-slate-500 font-medium">Pharmacy Terminal</span>
        </div>
      </div>

      {/* POS Quick CTA */}
      <div className="p-3">
        <Link
          href="/dashboard/pos"
          onClick={onCloseMobile}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-xs ${
            pathname === "/dashboard/pos"
              ? "bg-emerald-600 text-white shadow-emerald-200"
              : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-4 h-4" />
            <span>Open POS Terminal</span>
          </div>
          {totalQuantity > 0 && (
            <span
              className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                pathname === "/pos"
                  ? "bg-white text-emerald-700"
                  : "bg-emerald-600 text-white"
              }`}
            >
              {totalQuantity}
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="px-3 py-1 flex-1 space-y-1">
        <div className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Menu
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-emerald-600" : "text-slate-400"
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.isPOS && totalQuantity > 0 ? (
                <span className="w-5 h-5 flex items-center justify-center text-[11px] font-bold bg-emerald-600 text-white rounded-full">
                  {totalQuantity}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              ) : null}
            </Link>
          );
        })}
      </div>

      {/* System Status & Authenticated Operator Card */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
        <div className="flex items-center justify-between px-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Terminal Online
          </span>
          <span className="font-mono text-[11px] uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-semibold">
            {user?.role || "cashier"}
          </span>
        </div>

        <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2.5 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold shrink-0 text-xs">
            {user?.name ? user.name[0] : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {user?.name || "Mohammad Rafiq"}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {user?.counter || "Counter 01"} • {user?.shift || "Day Shift"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out Terminal"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
