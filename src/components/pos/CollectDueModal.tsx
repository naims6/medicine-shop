"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Sale } from "@/types";
import { salesRepository } from "@/repositories/salesRepository";
import {
  Banknote,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  ArrowRight,
} from "lucide-react";

interface CollectDueModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  onDueCollected: (updatedSale: Sale) => void;
}

export function CollectDueModal({
  isOpen,
  onClose,
  sale,
  onDueCollected,
}: CollectDueModalProps) {
  if (!isOpen || !sale) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Collect Due Payment (বাকি পরিশোধ)"
      description={`Customer invoice: ${sale.invoiceNumber}`}
      maxWidth="max-w-md"
    >
      <CollectDueContent
        sale={sale}
        onClose={onClose}
        onDueCollected={onDueCollected}
      />
    </Modal>
  );
}

function CollectDueContent({
  sale,
  onClose,
  onDueCollected,
}: {
  sale: Sale;
  onClose: () => void;
  onDueCollected: (updatedSale: Sale) => void;
}) {
  const currentDue =
    typeof sale.dueAmount === "number"
      ? sale.dueAmount
      : Math.max(0, sale.totalAmount - (sale.amountReceived || 0));

  const [paymentInput, setPaymentInput] = useState<string>(String(currentDue));
  const [paymentAmount, setPaymentAmount] = useState<number>(currentDue);
  const [collectionNote, setCollectionNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      setPaymentInput(String(currentDue));
      setPaymentAmount(currentDue);
    });
  }, [currentDue]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPaymentInput(val);
    const parsed = parseFloat(val);
    if (isNaN(parsed) || parsed <= 0) {
      setPaymentAmount(0);
    } else {
      setPaymentAmount(parsed);
    }
    setError(null);
  };

  const setPreset = (amount: number) => {
    const clamped = Math.min(currentDue, Math.max(1, Math.round(amount)));
    setPaymentAmount(clamped);
    setPaymentInput(String(clamped));
    setError(null);
  };

  const isFullPayment = paymentAmount >= currentDue;
  const remainingAfterPayment = Math.max(0, Number((currentDue - paymentAmount).toFixed(2)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) {
      setError("Please enter a valid payment amount greater than 0");
      return;
    }
    if (paymentAmount > currentDue) {
      setError(`Payment cannot exceed the outstanding due of ৳${currentDue.toFixed(2)}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await salesRepository.collectDue(
        sale.id,
        paymentAmount,
        collectionNote.trim() || undefined
      );
      onDueCollected(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Customer & Due Summary Card */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <User className="w-4 h-4 text-amber-700" />
              <span>{sale.customerName || "Customer (বাকি গ্রাহক)"}</span>
            </div>
            {sale.customerPhone && (
              <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5 ml-5">
                <Phone className="w-3 h-3 text-slate-400" />
                {sale.customerPhone}
              </p>
            )}
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            {sale.invoiceNumber}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-amber-200/80 text-center">
          <div className="bg-white/80 p-2 rounded-lg border border-amber-100">
            <span className="text-[10px] text-slate-500 block">Total Bill</span>
            <span className="text-xs font-bold font-mono text-slate-800">
              ৳{sale.totalAmount.toFixed(2)}
            </span>
          </div>
          <div className="bg-white/80 p-2 rounded-lg border border-amber-100">
            <span className="text-[10px] text-slate-500 block">Already Paid</span>
            <span className="text-xs font-bold font-mono text-emerald-700">
              ৳{(sale.amountReceived || 0).toFixed(2)}
            </span>
          </div>
          <div className="bg-white/80 p-2 rounded-lg border border-amber-200 shadow-xs">
            <span className="text-[10px] text-amber-800 font-bold block">Current Due</span>
            <span className="text-xs font-extrabold font-mono text-amber-700">
              ৳{currentDue.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Input Section */}
      <div className="space-y-2">
        <label htmlFor="collect-amount" className="block text-xs font-bold text-slate-800">
          Receiving Payment Amount (আদায়কৃত টাকা):
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-base text-slate-500">
            ৳
          </span>
          <input
            id="collect-amount"
            type="number"
            step="0.5"
            min="1"
            max={currentDue}
            value={paymentInput}
            onChange={handleAmountChange}
            className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            placeholder="0.00"
            autoFocus
          />
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setPreset(currentDue)}
            className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
              isFullPayment
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Full Payment (৳{currentDue.toFixed(0)})
          </button>
          {currentDue > 100 && (
            <button
              type="button"
              onClick={() => setPreset(currentDue / 2)}
              className="px-2.5 py-1 text-xs rounded-md font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              50% (৳{(currentDue / 2).toFixed(0)})
            </button>
          )}
        </div>
      </div>

      {/* Payment Outcome Preview Alert */}
      {isFullPayment ? (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Full Settlement Confirmed</span>
            <span className="text-[11px] text-emerald-700">
              The entire outstanding due of ৳{currentDue.toFixed(2)} will be cleared. This transaction will be permanently removed from owing and added to main completed cash sales!
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
          <ArrowRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Partial Settlement</span>
            <span className="text-[11px] text-blue-700">
              Receiving ৳{paymentAmount.toFixed(2)}. Remaining due will be reduced to{" "}
              <strong className="font-mono font-bold text-amber-800">৳{remainingAfterPayment.toFixed(2)}</strong>.
            </span>
          </div>
        </div>
      )}

      {/* Optional Note */}
      <div>
        <label htmlFor="collect-note" className="block text-[11px] font-medium text-slate-600 mb-1">
          Payment Note (Optional):
        </label>
        <input
          id="collect-note"
          type="text"
          value={collectionNote}
          onChange={(e) => setCollectionNote(e.target.value)}
          placeholder="e.g. Paid in cash at shop counter"
          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
        />
      </div>

      {error && (
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || paymentAmount <= 0 || paymentAmount > currentDue}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-lg transition-all shadow-xs ${
            isSubmitting || paymentAmount <= 0 || paymentAmount > currentDue
              ? "bg-slate-300 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-200 cursor-pointer"
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>
            {isSubmitting
              ? "Recording..."
              : isFullPayment
              ? "Clear Due & Convert to Main Sale"
              : `Collect ৳${paymentAmount.toFixed(2)}`}
          </span>
        </button>
      </div>
    </form>
  );
}
