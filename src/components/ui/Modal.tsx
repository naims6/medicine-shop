"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-xl",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog Window */}
      <div
        className={`relative z-10 w-full ${maxWidth} bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">{title}</h3>
            {description && (
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-3.5 sm:p-5">{children}</div>
      </div>
    </div>
  );
}
