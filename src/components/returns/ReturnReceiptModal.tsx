"use client";

import React, { useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Return } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Printer } from "lucide-react";

interface ReturnReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnData: Return | null;
}

export function ReturnReceiptModal({
  isOpen,
  onClose,
  returnData,
}: ReturnReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !returnData) return null;

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Return Memo - ${returnData.returnNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; font-size: 11px; padding: 8px; color: #111; max-width: 300px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 1px dashed #999; padding-bottom: 8px; margin-bottom: 8px; }
          .shop-name { font-size: 14px; font-weight: bold; }
          .return-badge { display: inline-block; border: 1px solid #666; padding: 2px 8px; margin: 4px 0; font-size: 10px; font-weight: bold; letter-spacing: 1px; }
          .meta { margin-bottom: 8px; }
          .meta-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
          .items-header { border-top: 1px dashed #999; border-bottom: 1px dashed #999; padding: 4px 0; font-weight: bold; display: flex; }
          .item-row { padding: 3px 0; border-bottom: 1px dotted #ccc; }
          .item-name { font-weight: bold; }
          .item-detail { display: flex; justify-content: space-between; font-size: 10px; color: #555; }
          .item-reason { font-size: 9px; color: #888; }
          .totals { border-top: 1px dashed #999; padding-top: 6px; margin-top: 6px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
          .grand-total { font-size: 14px; font-weight: bold; border-top: 1px solid #333; padding-top: 4px; margin-top: 4px; }
          .footer { text-align: center; border-top: 1px dashed #999; padding-top: 8px; margin-top: 10px; font-size: 9px; color: #666; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Return Memo"
      description={`Return ${returnData.returnNumber}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Printable Receipt Content */}
        <div
          ref={printRef}
          className="bg-white border border-slate-200 rounded-lg p-4 text-xs font-mono space-y-3"
        >
          {/* Header */}
          <div className="header text-center border-b border-dashed border-slate-300 pb-3">
            <div className="shop-name text-sm font-bold text-slate-900">
              Shodesh Pharmacy
            </div>
            <div className="text-[10px] text-slate-500">
              Mirpur, Dhaka - 1216
            </div>
            <div className="return-badge inline-block border border-slate-500 px-2 py-0.5 mt-1.5 text-[10px] font-bold tracking-widest text-slate-700">
              RETURN MEMO
            </div>
          </div>

          {/* Meta Info */}
          <div className="meta space-y-1 text-[11px]">
            <div className="meta-row flex justify-between">
              <span className="text-slate-500">Return #:</span>
              <span className="font-bold text-slate-900">
                {returnData.returnNumber}
              </span>
            </div>
            <div className="meta-row flex justify-between">
              <span className="text-slate-500">Original Invoice:</span>
              <span className="font-bold text-slate-900">
                {returnData.originalInvoiceNumber}
              </span>
            </div>
            <div className="meta-row flex justify-between">
              <span className="text-slate-500">Date:</span>
              <span className="text-slate-800">
                {formatDateTime(returnData.createdAt)}
              </span>
            </div>
            <div className="meta-row flex justify-between">
              <span className="text-slate-500">Processed By:</span>
              <span className="text-slate-800">
                {returnData.processedBy}
              </span>
            </div>
            <div className="meta-row flex justify-between">
              <span className="text-slate-500">Refund Via:</span>
              <span className="text-slate-800">
                {returnData.refundMethod}
              </span>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="items-header border-t border-b border-dashed border-slate-300 py-1.5 flex text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              <span className="flex-1">Item</span>
              <span className="w-10 text-center">Qty</span>
              <span className="w-16 text-right">Amount</span>
            </div>

            {returnData.items.map((item, idx) => (
              <div
                key={idx}
                className="item-row py-1.5 border-b border-dotted border-slate-100"
              >
                <div className="item-name font-bold text-slate-900 text-[11px]">
                  {item.name}
                </div>
                <div className="item-detail flex justify-between text-[10px] text-slate-500">
                  <span>
                    {item.strength} • {item.dosageForm}
                  </span>
                  <span>
                    @ {formatCurrency(item.unitPrice)}/{item.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <span className="item-reason text-[9px] text-slate-400 italic">
                    Reason: {item.reason}
                  </span>
                  <span className="text-[11px]">
                    <span className="text-slate-600">{item.quantity} ×</span>{" "}
                    <span className="font-bold text-slate-900">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="totals border-t border-dashed border-slate-300 pt-2 space-y-1">
            <div className="total-row flex justify-between text-[11px]">
              <span className="text-slate-500">Total Items Returned:</span>
              <span className="font-bold text-slate-900">
                {returnData.totalItems} pcs
              </span>
            </div>
            <div className="grand-total flex justify-between text-sm font-bold border-t border-slate-400 pt-2 mt-1">
              <span className="text-slate-700">Total Refund:</span>
              <span className="text-rose-700">
                {formatCurrency(returnData.totalRefundAmount)}
              </span>
            </div>
          </div>

          {/* Notes */}
          {returnData.notes && (
            <div className="text-[10px] text-slate-500 pt-1">
              Note: {returnData.notes}
            </div>
          )}

          {/* Footer */}
          <div className="footer text-center border-t border-dashed border-slate-300 pt-2 text-[9px] text-slate-400">
            <p>Stock has been restored to inventory.</p>
            <p className="mt-0.5">
              Thank you • Shodesh Pharmacy POS
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer text-center"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Return Memo</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
