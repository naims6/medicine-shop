"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { CartProvider } from "@/stores/CartContext";
import { X } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <CartProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex h-full shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative z-10 w-72 max-w-[80vw] h-full bg-white shadow-xl flex flex-col">
              <div className="absolute top-4 right-3">
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
          <TopNav onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
          <main className="flex-1 overflow-y-auto bg-slate-50/70 p-4 md:p-6">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
              {children}
            </div>
          </main>
        </div>
      </div>
    </CartProvider>
  );
}
