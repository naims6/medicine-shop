"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/shared/FormField";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PasswordInput } from "@/components/shared/PasswordInput";

import { userFormSchema, type UserFormData } from "@/schemas/user.schema";
import type { User } from "@/types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface UserFormProps {
  /** "create" shows the password field; "edit" hides it */
  mode: "create" | "edit";
  /** Required when mode is "edit" — pre-fills the form */
  user?: User;
  isPending: boolean;
  apiError: string;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UserForm({
  mode,
  user,
  isPending,
  apiError,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const isEditing = mode === "edit";

  const { register, handleSubmit, control, formState: { errors } } =
    useForm<UserFormData>({
      resolver: zodResolver(userFormSchema),
      defaultValues: isEditing && user
        ? { name: user.name, email: user.email, role: user.role, status: user.status, phone: user.phone ?? "", password: "" }
        : { name: "", email: "", password: "", role: "Salesman", status: "Active", phone: "" },
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

      {apiError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      {/* Name */}
      <FormField label="Full Name" htmlFor="name" required error={errors.name?.message}>
        <Input
          id="name"
          placeholder="Full name"
          disabled={isPending}
          className={errors.name ? "border-rose-400 focus-visible:ring-rose-400" : ""}
          {...register("name")}
        />
      </FormField>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            disabled={isPending}
            className={errors.email ? "border-rose-400 focus-visible:ring-rose-400" : ""}
            {...register("email")}
          />
        </FormField>
        <FormField label="Phone" htmlFor="phone">
          <Input id="phone" placeholder="+880 1…" disabled={isPending} {...register("phone")} />
        </FormField>
      </div>

      {/* Password — create only */}
      {!isEditing && (
        <FormField label="Password" htmlFor="password" required error={errors.password?.message}>
          <PasswordInput
            id="password"
            placeholder="Min. 6 characters"
            disabled={isPending}
            hasError={!!errors.password}
            {...register("password")}
          />
        </FormField>
      )}

      {/* Role + Status */}
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Role" required error={errors.role?.message}>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                <SelectTrigger className={errors.role ? "border-rose-400" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Salesman">Salesman</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField label="Status" required error={errors.status?.message}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      <DialogFooter className="px-0 pb-0 pt-3 border-t border-slate-100">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? (
            <>
              <LoadingSpinner size="w-3.5 h-3.5" color="border-white/40 border-t-white" />
              {isEditing ? "Saving…" : "Creating…"}
            </>
          ) : isEditing ? "Save Changes" : "Create User"}
        </Button>
      </DialogFooter>

    </form>
  );
}
