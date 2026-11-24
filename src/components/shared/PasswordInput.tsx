import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Applies a rose error ring when true */
  hasError?: boolean;
}

/**
 * A drop-in replacement for `<Input type="password">` with an inline
 * show/hide toggle. Accepts all native input props plus `hasError`.
 *
 * Usage:
 * ```tsx
 * <PasswordInput
 *   id="password"
 *   placeholder="Min. 6 characters"
 *   hasError={!!errors.password}
 *   {...register("password")}
 * />
 * ```
 */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ hasError, className, disabled, ...props }, ref) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={show ? "text" : "password"}
        disabled={disabled}
        className={cn(
          "pr-9",
          hasError && "border-rose-400 focus-visible:ring-rose-400",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={() => setShow((v) => !v)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded disabled:opacity-40"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          <EyeOff className="w-3.5 h-3.5" aria-hidden />
        ) : (
          <Eye className="w-3.5 h-3.5" aria-hidden />
        )}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";
