"use client";

import React from "react";
import { Sale } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Printer, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  onNewSale?: () => void;
}

export function ReceiptModal({
  isOpen,
  onClose,
  sale,
  onNewSale,
}: ReceiptModalProps) {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sale Completed Successfully"
      description={`Invoice: ${sale.invoiceNumber}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Success Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-3 text-emerald-800">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Transaction Recorded.</span> Total of{" "}
            <span className="font-bold">{formatCurrency(sale.totalAmount)}</span> paid via{" "}
            <span className="font-semibold">{sale.paymentMethod}</span>.
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div
          id="printable-receipt"
          className="bg-white border border-slate-200 rounded-lg p-4 font-mono text-xs text-slate-800 shadow-inner"
        >
          {/* Receipt Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <h2 className="text-base font-bold text-slate-900 font-sans tracking-tight">
              Shodesh Pharmacy
            </h2>
            <p className="text-[11px] text-slate-500 font-sans">
              Holding #42/A, Main Road, Block-D, Section-6, Mirpur, Dhaka
            </p>
            <p className="text-[11px] text-slate-500 font-sans">
              Hotline: +880 1711-234567 • License: DGDA/DL-2024/98421
            </p>
            <div className="mt-2 text-[10px] bg-slate-100 py-0.5 px-2 rounded inline-block font-sans font-medium text-slate-700">
              RETAIL CASH MEMO
            </div>
          </div>

          {/* Meta Info */}
          <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice:</span>
              <span className="font-bold text-slate-900">{sale.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date:</span>
              <span>{formatDateTime(sale.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cashier:</span>
              <span>{sale.cashierName} (Counter 01)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment:</span>
              <span className="font-semibold">{sale.paymentMethod}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-2.5 border-b border-dashed border-slate-300">
            <div className="grid grid-cols-12 font-bold text-[10px] text-slate-400 uppercase tracking-wider pb-1">
              <span className="col-span-6">Item / Generic</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Price</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            <div className="divide-y divide-slate-100">
              {sale.items.map((item, index) => (
                <div key={index} className="py-1.5 grid grid-cols-12 text-[11px] items-start">
                  <div className="col-span-6 pr-1">
                    <p className="font-semibold text-slate-900 leading-tight">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-sans">
                      {item.strength} • {item.dosageForm}
                    </p>
                    {(item.batchNumber || item.expiryDate) && (
                      <p className="text-[9px] text-slate-400 font-mono">
                        {item.batchNumber ? `B:${item.batchNumber}` : ""}
                        {item.expiryDate ? ` Exp:${item.expiryDate}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 text-center font-medium">
                    {item.quantity}
                  </div>
                  <div className="col-span-2 text-right text-slate-600">
                    ৳{item.unitPrice.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right font-semibold text-slate-900">
                    ৳{item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="py-2.5 space-y-1.5 border-b border-dashed border-slate-300 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Items:</span>
              <span>{sale.totalItems} pcs ({sale.items.length} lines)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-medium">৳{sale.subtotal.toFixed(2)}</span>
            </div>
            {sale.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>
                  Discount {sale.discountType === "percentage" ? `(${sale.discountValue}%)` : "(Fixed)"}:
                </span>
                <span>-৳{sale.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>NET PAYABLE:</span>
              <span>{formatCurrency(sale.totalAmount)}</span>
            </div>
          </div>

          {/* Payment & Change / Due breakdown */}
          <div className="py-2 space-y-1 text-[11px] border-b border-dashed border-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-semibold">{sale.paymentMethod === "Owing" ? "Owing (বাকি)" : "Cash"}</span>
            </div>
            {sale.paymentMethod === "Owing" ? (
              <div className="flex justify-between text-amber-800 font-semibold">
                <span>Due (বাকি):</span>
                <span>৳{(sale.totalAmount - (sale.amountReceived || 0)).toFixed(2)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500">Paid Amount:</span>
                  <span className="font-semibold">৳{sale.amountReceived.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Change Returned:</span>
                  <span className="font-semibold text-slate-900">৳{sale.changeAmount.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-3 text-center text-[10px] text-slate-500 space-y-1 font-sans">
            <p className="flex items-center justify-center gap-1 font-medium text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Thank you for choosing Shodesh Pharmacy!
            </p>
            <p>Medicines sold cannot be returned without original receipt.</p>
            <p className="text-[9px] text-slate-400 font-mono">
              Software by Shodesh Pharmacy POS • Verified Terminal
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
          {onNewSale && (
            <button
              onClick={() => {
                onClose();
                onNewSale();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-sm shadow-emerald-200 transition-colors cursor-pointer order-1 sm:order-2"
            >
              <span>Start Next Sale</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-sm transition-colors cursor-pointer order-2 sm:order-1"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          {!onNewSale && (
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
