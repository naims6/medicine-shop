"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Variant applied to the confirm button. Defaults to "default". */
  confirmVariant?: "default" | "destructive" | "outline" | "ghost";
  isPending?: boolean;
  pendingLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  /** Optional icon shown to the left of the title */
  icon?: React.ReactNode;
}

/**
 * Generic confirm dialog. Use this for any action that needs a "are you sure?"
 * step — logout, status changes, irreversible operations, etc.
 *
 * For delete-specific confirmations use DeleteConfirmModal instead.
 */
export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "default",
  isPending = false,
  pendingLabel,
  onCancel,
  onConfirm,
  icon,
}: ConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-sm p-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon && (
              <span className="shrink-0">{icon}</span>
            )}
            {title}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-xs text-slate-600 mt-1">{description}</div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="px-5 pb-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <span className="w-3 h-3 border-2 border-current/40 border-t-current rounded-full animate-spin" />
                {pendingLabel ?? confirmLabel}
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
