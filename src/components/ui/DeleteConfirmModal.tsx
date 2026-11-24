interface DeleteConfirmModalProps {
  title?: string;
  description: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

import React from "react";

export function DeleteConfirmModal({
  title = "Confirm Delete",
  description,
  onCancel,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 p-5 space-y-3">
        <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
        <div className="text-xs text-slate-600">{description}</div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
