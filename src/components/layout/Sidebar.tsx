"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Pill,
  History,
  RotateCcw,
  Users,
  Store,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/stores/CartContext";

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
    name: "Returns",
    href: "/dashboard/returns",
    icon: RotateCcw,
    badge: null,
  },
  {
    name: "User Management",
    href: "/dashboard/users",
    icon: Users,
    badge: null,
  },
];

interface SidebarProps {
  onCloseMobile?: () => void;
}

const emptySubscribe = () => () => {};

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { totalQuantity } = useCart();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const cartCount = mounted ? totalQuantity : 0;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-200 gap-3">
        <Link href="/" className="flex items-center gap-2.5 group" title="Visit Shodesh Pharmacy Store Home">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-700 transition-colors">
            <Store className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 tracking-tight text-sm flex items-center gap-1.5">
              Shodesh Pharmacy
            </span>
            <span className="text-[11px] text-slate-400 font-medium">POS Terminal</span>
          </div>
        </Link>
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
          {cartCount > 0 && (
            <span
              className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                pathname === "/pos"
                  ? "bg-white text-emerald-700"
                  : "bg-emerald-600 text-white"
              }`}
            >
              {cartCount}
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
              {item.isPOS && cartCount > 0 ? (
                <span className="w-5 h-5 flex items-center justify-center text-[11px] font-bold bg-emerald-600 text-white rounded-full">
                  {cartCount}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              ) : null}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
