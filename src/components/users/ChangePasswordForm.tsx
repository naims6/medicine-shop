"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DialogFooter } from "@/components/ui/dialog";
import { FormField } from "@/components/shared/FormField";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PasswordInput } from "@/components/shared/PasswordInput";

import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "@/schemas/user.schema";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChangePasswordFormProps {
  /** Disables all controls while the mutation is in-flight */
  isPending: boolean;
  /** Server-side error message; shown in a destructive Alert */
  apiError: string;
  onSubmit: (data: ChangePasswordFormData) => void;
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Pure form body for changing a user's password.
 * Contains no Dialog — compose this inside any container you need.
 *
 * ```tsx
 * <ChangePasswordForm
 *   isPending={mutation.isPending}
 *   apiError={apiError}
 *   onSubmit={handleSubmit}
 *   onCancel={handleClose}
 * />
 * ```
 */
export function ChangePasswordForm({
  isPending,
  apiError,
  onSubmit,
  onCancel,
}: ChangePasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Server error */}
      {apiError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <FormField
        label="New Password"
        htmlFor="newPassword"
        required
        error={errors.newPassword?.message}
      >
        <PasswordInput
          id="newPassword"
          placeholder="Min. 6 characters"
          disabled={isPending}
          hasError={!!errors.newPassword}
          {...register("newPassword")}
        />
      </FormField>

      <FormField
        label="Confirm Password"
        htmlFor="confirmPassword"
        required
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          id="confirmPassword"
          placeholder="Re-enter new password"
          disabled={isPending}
          hasError={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
      </FormField>

      <DialogFooter className="px-0 pb-0 pt-3 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" variant="amber" size="sm" disabled={isPending}>
          {isPending ? (
            <>
              <LoadingSpinner size="w-3.5 h-3.5" color="border-white/40 border-t-white" />
              Saving…
            </>
          ) : (
            <>
              <KeyRound className="w-3.5 h-3.5" />
              Change Password
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
