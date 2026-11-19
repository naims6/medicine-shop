"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { CartProvider } from "@/stores/CartContext";
import { AuthProvider, useAuth } from "@/stores/AuthContext";
import { X } from "lucide-react";

function ProtectedAppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isDashboardRoute = pathname.startsWith("/dashboard");

  useEffect(() => {
    // Only dashboard routes require authentication
    if (!isLoading && !isAuthenticated && isDashboardRoute) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, isDashboardRoute, router]);

  // Public pages (Home page `/`, Login page `/login`, etc.) render without dashboard chrome
  if (!isDashboardRoute) {
    return <>{children}</>;
  }

  // If checking session on a protected dashboard route, show subtle loading indicator
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-2">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-sans">
          Loading dashboard...
        </p>
      </div>
    );
  }

  // If unauthenticated on a protected dashboard route and redirect is in progress
  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 gap-2">
        <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-sans">
          Redirecting to login...
        </p>
      </div>
    );
  }

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

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedAppContent>{children}</ProtectedAppContent>
    </AuthProvider>
  );
}
