import React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  /** Label text */
  label: string;
  /** HTML id of the matching input — sets htmlFor on the label */
  htmlFor?: string;
  /** Whether the field is mandatory — renders a red asterisk */
  required?: boolean;
  /** Validation/error message; omit or pass undefined to hide */
  error?: string;
  /** The input (or select/textarea) element */
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps a form control with a label and optional inline error message.
 *
 * Usage:
 * ```tsx
 * <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
 *   <Input id="email" {...register("email")} />
 * </FormField>
 * ```
 */
export function FormField({
  label,
  htmlFor,
  required,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}
