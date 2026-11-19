"use client";

import { useState, useRef, useEffect } from "react";
import { MedicineSearch } from "@/components/pos/MedicineSearch";
import { CartPanel } from "@/components/pos/CartPanel";
import { CheckoutModal } from "@/components/pos/CheckoutModal";
import { ReceiptModal } from "@/components/pos/ReceiptModal";
import { Sale } from "@/types";
import { useCart } from "@/stores/CartContext";

export default function POSPage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const { items } = useCart();

  // Cashier Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2: Focus Search Input
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }

      // F4: Trigger Checkout if items exist
      if (e.key === "F4") {
        e.preventDefault();
        if (items.length > 0 && !isCheckoutOpen && !isReceiptOpen) {
          setIsCheckoutOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items.length, isCheckoutOpen, isReceiptOpen]);

  const handleSaleCompleted = (sale: Sale) => {
    setCompletedSale(sale);
    setIsReceiptOpen(true);
  };

  const handleStartNewSale = () => {
    setCompletedSale(null);
    setIsReceiptOpen(false);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 150);
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-4 overflow-hidden">
      {/* Left Area: Medicine Search & Catalogue Grid */}
      <div className="flex-1 h-full min-h-0 flex flex-col">
        <MedicineSearch searchInputRef={searchInputRef} />
      </div>

      {/* Right Area: Cart & Checkout Panel */}
      <div className="w-full md:w-96 lg:w-[420px] h-full min-h-0 flex flex-col shrink-0">
        <CartPanel onOpenCheckout={() => setIsCheckoutOpen(true)} />
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
