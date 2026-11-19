"use client";

import React, { useState } from "react";
import { useCart } from "@/stores/CartContext";
import { formatCurrency } from "@/lib/utils";
import { formatExpiryDate } from "@/lib/expiryUtils";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  Percent,
  CircleDollarSign,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface CartPanelProps {
  onOpenCheckout: () => void;
}

export function CartPanel({ onOpenCheckout }: CartPanelProps) {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    discountType,
    discountValue,
    setDiscount,
    subtotal,
    discountAmount,
    total,
    totalQuantity,
    uniqueItemCount,
  } = useCart();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [discountInput, setDiscountInput] = useState<string>(String(discountValue || 0));

  const handleDiscountChange = (valStr: string) => {
    setDiscountInput(valStr);
    const parsed = parseFloat(valStr);
    setDiscount(discountType, isNaN(parsed) ? 0 : parsed);
  };

  const handleToggleDiscountType = (type: "percentage" | "fixed") => {
    setDiscount(type, 0);
    setDiscountInput("0");
  };

  const applyPresetDiscount = (val: number) => {
    setDiscountInput(String(val));
    setDiscount(discountType, val);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Cart Header */}
      <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Customer Bill
            </h3>
            <p className="text-[11px] text-slate-500">
              {uniqueItemCount} medicines • {totalQuantity} units
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-md transition-colors font-medium cursor-pointer"
          >
            Clear Cart
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-300">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700">Cart is Empty</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Select or search medicines from the catalogue to add them to this transaction.
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {items.map((item) => (
              <div
                key={item.medicineId}
                className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors"
              >
                {/* Item Info row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-slate-900 leading-snug truncate">
                      {item.name}
                    </h5>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span className="truncate">{item.genericName} • {item.strength}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {item.batchNumber && (
                        <span className="inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          Batch: {item.batchNumber}
                        </span>
                      )}
                      {item.expiryDate && (
                        <span className="text-[10px] text-slate-500">
                          Exp: {formatExpiryDate(item.expiryDate)}
                        </span>
                      )}
                      {typeof item.currentStock === "number" && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          (Avail: {item.currentStock})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {formatCurrency(item.subtotal)}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      @{formatCurrency(item.unitPrice)}
                    </span>
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateQuantity(item.medicineId, item.quantity - 1);
                        } else {
                          removeItem(item.medicineId);
                        }
                      }}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
                      title={item.quantity === 1 ? "Remove item" : "Decrease quantity"}
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1) {
                          updateQuantity(item.medicineId, val);
                        }
                      }}
                      className="w-10 text-center font-mono font-bold text-xs bg-transparent focus:outline-none"
                    />

                    <button
                      type="button"
                      disabled={item.currentStock !== undefined && item.quantity >= item.currentStock}
                      onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                      className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                        item.currentStock !== undefined && item.quantity >= item.currentStock
                          ? "text-slate-300 cursor-not-allowed bg-slate-100"
                          : "text-slate-600 hover:bg-white hover:text-slate-900 cursor-pointer"
                      }`}
                      title={
                        item.currentStock !== undefined && item.quantity >= item.currentStock
                          ? "Max available stock reached"
                          : "Increase quantity"
                      }
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.medicineId)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Remove item from cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Footer: Discounts, Totals & Checkout */}
      {items.length > 0 && (
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3">
          {/* Discount Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Discount
              </span>
              {/* Type Switcher */}
              <div className="flex items-center bg-slate-200/80 rounded-md p-0.5">
                <button
                  type="button"
                  onClick={() => handleToggleDiscountType("percentage")}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                    discountType === "percentage"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Percent className="w-2.5 h-2.5 inline mr-0.5" />%
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleDiscountType("fixed")}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                    discountType === "fixed"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <CircleDollarSign className="w-2.5 h-2.5 inline mr-0.5" />৳
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max={discountType === "percentage" ? "100" : String(subtotal)}
                value={discountInput}
                onChange={(e) => handleDiscountChange(e.target.value)}
                placeholder="0"
                className="w-20 px-2 py-1 bg-white border border-slate-300 rounded-md text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />

              <div className="flex items-center gap-1">
                {discountType === "percentage" ? (
                  [0, 5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => applyPresetDiscount(pct)}
                      className="px-1.5 py-0.5 text-[10px] rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-600"
                    >
                      {pct}%
                    </button>
                  ))
                ) : (
                  [0, 10, 20, 50].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => applyPresetDiscount(amt)}
                      className="px-1.5 py-0.5 text-[10px] rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-600"
                    >
                      ৳{amt}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal ({totalQuantity} items):</span>
              <span className="font-mono font-medium text-slate-700">
                {formatCurrency(subtotal)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>
                  Discount {discountType === "percentage" ? `(${discountValue}%)` : "(Fixed)"}:
                </span>
                <span className="font-mono">-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-slate-300 text-slate-900">
              <span className="text-sm font-bold">Total Payable:</span>
              <span className="text-xl font-bold font-mono text-emerald-700">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            type="button"
            onClick={onOpenCheckout}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      )}

      {/* Confirmation Modal for Clearing Cart */}
      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear Shopping Cart?"
        description="Are you sure you want to remove all items from the current bill?"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p>
              This will remove all {items.length} items from the current transaction. This action cannot be undone.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                clearCart();
                setShowClearConfirm(false);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer"
            >
              Yes, Clear Cart
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
