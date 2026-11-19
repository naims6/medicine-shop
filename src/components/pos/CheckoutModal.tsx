"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { PaymentMethod, Sale } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Banknote,
  Smartphone,
  CreditCard,
  CircleDollarSign,
  AlertCircle,
  Check,
  Receipt,
} from "lucide-react";
import { salesRepository } from "@/repositories/salesRepository";
import { medicineRepository } from "@/repositories/medicineRepository";
import { useCart } from "@/stores/CartContext";
import { useAuth } from "@/stores/AuthContext";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleComplete: (sale: Sale) => void;
}

const paymentOptions: { id: PaymentMethod; label: string; icon: React.ElementType; color: string }[] = [
  { id: "Cash", label: "Cash", icon: Banknote, color: "text-emerald-600 bg-emerald-50 border-emerald-300" },
  { id: "bKash", label: "bKash", icon: Smartphone, color: "text-pink-600 bg-pink-50 border-pink-300" },
  { id: "Nagad", label: "Nagad", icon: Smartphone, color: "text-orange-600 bg-orange-50 border-orange-300" },
  { id: "Card", label: "Card / POS", icon: CreditCard, color: "text-blue-600 bg-blue-50 border-blue-300" },
  { id: "Other", label: "Other", icon: CircleDollarSign, color: "text-purple-600 bg-purple-50 border-purple-300" },
];

function CheckoutModalContent({
  onClose,
  onSaleComplete,
}: {
  onClose: () => void;
  onSaleComplete: (sale: Sale) => void;
}) {
  const {
    items,
    subtotal,
    discountType,
    discountValue,
    discountAmount,
    total,
    totalQuantity,
    clearCart,
  } = useCart();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [amountReceived, setAmountReceived] = useState<number>(total);
  const [receivedInput, setReceivedInput] = useState<string>(String(total));
  const [referenceNote, setReferenceNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When switching payment method (e.g. bKash, Card), default received amount is exact total
  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method !== "Cash") {
      setAmountReceived(total);
      setReceivedInput(String(total));
    }
  };

  const handleReceivedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setReceivedInput(val);
    const parsed = parseFloat(val);
    setAmountReceived(isNaN(parsed) ? 0 : parsed);
  };

  const setPresetReceived = (amount: number) => {
    setAmountReceived(amount);
    setReceivedInput(String(amount));
  };

  const changeAmount = Math.max(0, Number((amountReceived - total).toFixed(2)));
  const isShortage = amountReceived < total;
  const shortageAmount = Number((total - amountReceived).toFixed(2));

  const handleCompleteSale = async () => {
    if (items.length === 0 || isShortage || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const sale = await salesRepository.create({
        cashierName: user?.name || "Mohammad Rafiq",
        items: items.map((i) => ({
          medicineId: i.medicineId,
          name: i.name,
          genericName: i.genericName,
          strength: i.strength,
          dosageForm: i.dosageForm,
          unitPrice: i.unitPrice,
          unit: i.unit,
          quantity: i.quantity,
          subtotal: i.subtotal,
        })),
        totalItems: totalQuantity,
        subtotal,
        discountType,
        discountValue,
        discountAmount,
        totalAmount: total,
        paymentMethod,
        amountReceived,
        changeAmount,
        notes: referenceNote.trim() || undefined,
        status: "completed",
      });

      // Automatically deduct physical stock in real time
      await medicineRepository.deductStock(
        items.map((i) => ({
          medicineId: i.medicineId,
          quantity: i.quantity,
        }))
      );

      clearCart();
      onClose();
      onSaleComplete(sale);
    } catch (err) {
      console.error("Sale checkout failed", err);
      alert("Failed to complete sale. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Total Payable Summary Card */}
      <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between shadow-xs">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Total Amount Payable
          </p>
          <p className="text-2xl font-bold font-mono tracking-tight text-white mt-0.5">
            {formatCurrency(total)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {totalQuantity} items • Subtotal {formatCurrency(subtotal)}
            {discountAmount > 0 && ` • Discount -${formatCurrency(discountAmount)}`}
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-right font-mono text-xs">
          <span className="text-slate-400 block text-[10px] uppercase font-sans font-semibold">Net Total</span>
          <span className="text-emerald-400 font-bold text-lg">৳{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Select Payment Method
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {paymentOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = paymentMethod === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectPaymentMethod(opt.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all cursor-pointer ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/80 text-emerald-800 ring-2 ring-emerald-500/20 font-semibold"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? "text-emerald-600" : "text-slate-500"}`} />
                <span className="text-xs">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount Received & Quick Presets (Only for Cash or editable) */}
      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="received-amount" className="text-xs font-semibold text-slate-700">
              Amount Received (৳)
            </label>
            {paymentMethod === "Cash" && (
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setPresetReceived(total)}
                  className="text-[11px] font-medium px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
                >
                  Exact
                </button>
                {[50, 100, 200, 500, 1000].map((preset) => {
                  if (preset >= total) {
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setPresetReceived(preset)}
                        className="text-[11px] font-medium px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
                      >
                        ৳{preset}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">
              ৳
            </span>
            <input
              id="received-amount"
              type="number"
              step="any"
              min="0"
              value={receivedInput}
              onChange={handleReceivedChange}
              className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Change or Shortage Display */}
        {isShortage ? (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Amount is short by <span className="font-bold">৳{shortageAmount.toFixed(2)}</span>. Full payment is required to complete sale.
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-900">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              Change to Return:
            </span>
            <span className="font-mono text-lg font-bold text-emerald-700">
              ৳{changeAmount.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Optional Notes or Transaction Ref */}
      <div>
        <label htmlFor="notes-ref" className="block text-xs font-semibold text-slate-700 mb-1">
          {paymentMethod === "bKash" || paymentMethod === "Nagad"
            ? "Transaction ID / Mobile Ref (Optional)"
            : paymentMethod === "Card"
            ? "Card Last 4 Digits / Auth Code (Optional)"
            : "Sale Notes / Customer Phone (Optional)"}
        </label>
        <input
          id="notes-ref"
          type="text"
          value={referenceNote}
          onChange={(e) => setReferenceNote(e.target.value)}
          placeholder={
            paymentMethod === "bKash"
              ? "e.g. TrxID 9K8L2M3X or 017xxxxxxxx"
              : "e.g. Dr. prescription # / Patient name"
          }
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 px-4 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
        >
          Cancel (Esc)
        </button>
        <button
          type="button"
          onClick={handleCompleteSale}
          disabled={isShortage || isSubmitting || items.length === 0}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs text-white transition-all shadow-sm ${
            isShortage || items.length === 0 || isSubmitting
              ? "bg-slate-300 cursor-not-allowed text-slate-500"
              : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 cursor-pointer"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>{isSubmitting ? "Processing Sale..." : "Complete Sale & Receipt"}</span>
        </button>
      </div>
    </div>
  );
}

export function CheckoutModal({
  isOpen,
  onClose,
  onSaleComplete,
}: CheckoutModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Payment & Checkout"
      description="Select payment mode and confirm received tender amount"
      maxWidth="max-w-xl"
    >
      <CheckoutModalContent onClose={onClose} onSaleComplete={onSaleComplete} />
    </Modal>
  );
}
