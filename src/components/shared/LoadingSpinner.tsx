import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  /** Tailwind size classes, e.g. "w-6 h-6". Defaults to "w-5 h-5". */
  size?: string;
  /** Tailwind color classes, e.g. "border-white". Defaults to emerald-600. */
  color?: string;
  /** Optional label shown below the spinner */
  label?: string;
  /** Center the spinner + label in its container */
  centered?: boolean;
  className?: string;
}

/**
 * Minimal CSS-only spinner that follows the project's existing style.
 *
 * Usage:
 * ```tsx
 * <LoadingSpinner />
 * <LoadingSpinner centered label="Loading…" />
 * // Inside a button:
 * <LoadingSpinner size="w-3.5 h-3.5" color="border-white/40 border-t-white" />
 * ```
 */
export function LoadingSpinner({
  size = "w-5 h-5",
  color = "border-emerald-600",
  label,
  centered = false,
  className,
}: LoadingSpinnerProps) {
  const spinner = (
    <span
      className={cn(
        "inline-block border-2 border-t-transparent rounded-full animate-spin shrink-0",
        size,
        color,
        className,
      )}
      aria-hidden="true"
    />
  );

  if (!centered && !label) return spinner;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2",
        centered && "justify-center min-h-[6rem]",
      )}
    >
      {spinner}
      {label && <p className="text-xs text-slate-500">{label}</p>}
    </div>
  );
}

/** Convenience full-page loading state used in layout guards. */
export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-1 items-center justify-center py-24 gap-2 flex-col">
      <LoadingSpinner size="w-6 h-6" />
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
