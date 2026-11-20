"use client";

import { useState, useRef } from "react";
import { MedicineSearch } from "@/components/pos/MedicineSearch";
import { CartPanel } from "@/components/pos/CartPanel";
import { CheckoutModal } from "@/components/pos/CheckoutModal";
import { ReceiptModal } from "@/components/pos/ReceiptModal";
import { useCart } from "@/stores/CartContext";
import { formatCurrency } from "@/lib/utils";
import { Sale } from "@/types";
import { ShoppingBag, ShoppingCart, ArrowRight } from "lucide-react";

export default function POSPage() {
  const [mobileTab, setMobileTab] = useState<"catalogue" | "cart">("catalogue");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const { totalQuantity, total, uniqueItemCount } = useCart();

  const handleSaleCompleted = (sale: Sale) => {
    setCompletedSale(sale);
    setIsReceiptOpen(true);
    // Switch back to catalogue view on mobile so cashier is ready for next customer
    setMobileTab("catalogue");
  };

  const handleStartNewSale = () => {
    setCompletedSale(null);
    setIsReceiptOpen(false);
    setMobileTab("catalogue");
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-2 sm:gap-4 overflow-hidden">
      {/* Mobile Top View Switcher (Catalogue vs Cart) */}
      <div className="md:hidden shrink-0 flex items-center bg-slate-200/80 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setMobileTab("catalogue")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            mobileTab === "catalogue"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
          <span>Medicines</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("cart")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all relative ${
            mobileTab === "cart"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
          <span>Customer Bill</span>
          {totalQuantity > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-emerald-600 text-white">
              {totalQuantity}
            </span>
          )}
        </button>
      </div>

      {/* Left Area: Medicine Search & Catalogue Grid */}
      <div
        className={`flex-1 h-full min-h-0 flex flex-col ${
          mobileTab === "catalogue" ? "flex" : "hidden md:flex"
        }`}
      >
        <MedicineSearch searchInputRef={searchInputRef} />

        {/* Mobile Sticky Floating Cart Bar (Shown when viewing catalogue on mobile and cart has items) */}
        {totalQuantity > 0 && (
          <div className="md:hidden shrink-0 pt-2">
            <button
              type="button"
              onClick={() => setMobileTab("cart")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white p-3 rounded-xl shadow-lg shadow-emerald-700/20 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <span className="text-[11px] font-medium block leading-tight text-emerald-100">
                    {totalQuantity} {totalQuantity === 1 ? "unit" : "units"} ({uniqueItemCount}{" "}
                    {uniqueItemCount === 1 ? "medicine" : "medicines"})
                  </span>
                  <span className="text-base font-bold font-mono text-white leading-tight">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold bg-white text-emerald-800 px-3 py-1.5 rounded-lg shadow-xs">
                <span>View Bill & Pay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Right Area: Cart & Checkout Panel */}
      <div
        className={`w-full md:w-96 lg:w-[420px] h-full min-h-0 flex-col shrink-0 ${
          mobileTab === "cart" ? "flex flex-1" : "hidden md:flex"
        }`}
      >
        <CartPanel
          onOpenCheckout={() => setIsCheckoutOpen(true)}
          onBackToCatalogue={() => setMobileTab("catalogue")}
        />
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSaleComplete={handleSaleCompleted}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={completedSale}
        onNewSale={handleStartNewSale}
      />
    </div>
  );
}
