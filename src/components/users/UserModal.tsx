"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, AlertCircle, KeyRound } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  type CreateUserFormData,
  type UpdateUserFormData,
  type ChangePasswordFormData,
} from "@/schemas/user.schema";
import { useCreateUser } from "@/hooks/users/useCreateUser";
import { useUpdateUser } from "@/hooks/users/useUpdateUser";
import { useChangePassword } from "@/hooks/users/useChangePassword";
import type { User } from "@/types";
import { isApiError } from "@/lib/apiErrors";

// ---------------------------------------------------------------------------
// Shared field helpers
// ---------------------------------------------------------------------------

interface FieldErrorProps {
  message?: string;
}

function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return <p className="mt-1 text-[11px] text-rose-600">{message}</p>;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

function Input({ error, className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900
        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error ? "border-rose-400 bg-rose-50/30" : "border-slate-300"}
        ${className}`}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

function Select({ error, className = "", children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs text-slate-900
        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error ? "border-rose-400 bg-rose-50/30" : "border-slate-300"}
        ${className}`}
    >
      {children}
    </select>
  );
}

function FormLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-xs font-semibold text-slate-700 mb-1">
      {children}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
  );
}

function ApiErrorBanner({ message }: { message: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-px" />
      <span className="text-xs">{message}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// UserModal — Create / Edit
// ---------------------------------------------------------------------------

export interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
  onSuccess?: () => void;
}

export function UserModal({
  isOpen,
  onClose,
  userToEdit,
  onSuccess,
}: UserModalProps) {
  const isEditing = !!userToEdit;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const mutation = isEditing ? updateMutation : createMutation;
  const [apiError, setApiError] = useState("");

  // Create form
  const createForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "Salesman",
      status: "Active",
      phone: "",
    },
  });

  // Edit form
  const editForm = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: userToEdit?.name ?? "",
      email: userToEdit?.email ?? "",
      role: userToEdit?.role ?? "Salesman",
      status: userToEdit?.status ?? "Active",
      phone: userToEdit?.phone ?? "",
    },
  });

  // Keep edit form in sync when userToEdit changes
  useEffect(() => {
    if (userToEdit) {
      editForm.reset({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role,
        status: userToEdit.status,
        phone: userToEdit.phone ?? "",
      });
    }
  }, [userToEdit, editForm]);

  // Clear error and form state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setApiError("");
      createMutation.reset();
      updateMutation.reset();
      if (!isEditing) createForm.reset();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const [showPassword, setShowPassword] = useState(false);

  const handleClose = () => {
    setApiError("");
    onClose();
  };

  // ---- Submit handlers ----

  const handleCreate = createForm.handleSubmit(async (data) => {
    setApiError("");
    try {
      await createMutation.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        status: data.status,
        phone: data.phone || undefined,
      });
      createForm.reset();
      onSuccess?.();
      handleClose();
    } catch (err) {
      setApiError(
        isApiError(err) ? err.message : "Failed to create user. Please try again.",
      );
    }
  });

  const handleUpdate = editForm.handleSubmit(async (data) => {
    if (!userToEdit) return;
    setApiError("");
    try {
      await updateMutation.mutateAsync({
        id: userToEdit.id,
        payload: {
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.status,
          phone: data.phone || undefined,
        },
      });
      onSuccess?.();
      handleClose();
    } catch (err) {
      setApiError(
        isApiError(err) ? err.message : "Failed to update user. Please try again.",
      );
    }
  });

  const isSubmitting = mutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Edit User" : "Add User"}
      description={
        isEditing
          ? "Update the user's profile. Use the key icon to change their password."
          : "Create a new user account for the pharmacy system."
      }
      maxWidth="max-w-md"
    >
      <form
        onSubmit={isEditing ? handleUpdate : handleCreate}
        className="space-y-4"
        noValidate
      >
        {apiError && <ApiErrorBanner message={apiError} />}

        {/* Name */}
        <div>
          <FormLabel required>Full Name</FormLabel>
          {isEditing ? (
            <>
              <Input
                {...editForm.register("name")}
                placeholder="Full name"
                error={!!editForm.formState.errors.name}
                disabled={isSubmitting}
              />
              <FieldError message={editForm.formState.errors.name?.message} />
            </>
          ) : (
            <>
              <Input
                {...createForm.register("name")}
                placeholder="Full name"
                error={!!createForm.formState.errors.name}
                disabled={isSubmitting}
              />
              <FieldError message={createForm.formState.errors.name?.message} />
            </>
          )}
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <FormLabel required>Email</FormLabel>
            {isEditing ? (
              <>
                <Input
                  {...editForm.register("email")}
                  type="email"
                  placeholder="user@example.com"
                  error={!!editForm.formState.errors.email}
                  disabled={isSubmitting}
                />
                <FieldError message={editForm.formState.errors.email?.message} />
              </>
            ) : (
              <>
                <Input
                  {...createForm.register("email")}
                  type="email"
                  placeholder="user@example.com"
                  error={!!createForm.formState.errors.email}
                  disabled={isSubmitting}
                />
                <FieldError message={createForm.formState.errors.email?.message} />
              </>
            )}
          </div>

          <div>
            <FormLabel>Phone</FormLabel>
            {isEditing ? (
              <Input
                {...editForm.register("phone")}
                placeholder="+880 1..."
                disabled={isSubmitting}
              />
            ) : (
              <Input
                {...createForm.register("phone")}
                placeholder="+880 1..."
                disabled={isSubmitting}
              />
            )}
          </div>
        </div>

        {/* Password — only on create */}
        {!isEditing && (
          <div>
            <FormLabel required>Password</FormLabel>
            <div className="relative">
              <Input
                {...createForm.register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 characters"
                error={!!createForm.formState.errors.password}
                disabled={isSubmitting}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <FieldError message={createForm.formState.errors.password?.message} />
          </div>
        )}

        {/* Role + Status */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FormLabel required>Role</FormLabel>
            {isEditing ? (
              <>
                <Select
                  {...editForm.register("role")}
                  error={!!editForm.formState.errors.role}
                  disabled={isSubmitting}
                >
                  <option value="Salesman">Salesman</option>
                  <option value="Admin">Admin</option>
                </Select>
                <FieldError message={editForm.formState.errors.role?.message} />
              </>
            ) : (
              <>
                <Select
                  {...createForm.register("role")}
                  error={!!createForm.formState.errors.role}
                  disabled={isSubmitting}
                >
                  <option value="Salesman">Salesman</option>
                  <option value="Admin">Admin</option>
                </Select>
                <FieldError message={createForm.formState.errors.role?.message} />
              </>
            )}
          </div>

          <div>
            <FormLabel required>Status</FormLabel>
            {isEditing ? (
              <Select
                {...editForm.register("status")}
                disabled={isSubmitting}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            ) : (
              <Select
                {...createForm.register("status")}
                disabled={isSubmitting}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {isEditing ? "Saving…" : "Creating…"}
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Create User"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// ChangePasswordModal — dedicated modal for PATCH /users/:id/password
// ---------------------------------------------------------------------------

export interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSuccess?: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: ChangePasswordModalProps) {
  const mutation = useChangePassword();
  const [apiError, setApiError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!isOpen) {
      setApiError("");
      mutation.reset();
      form.reset();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setApiError("");
    onClose();
  };

  const onSubmit = form.handleSubmit(async (data) => {
    setApiError("");
    try {
      await mutation.mutateAsync({
        id: user.id,
        payload: { newPassword: data.newPassword },
      });
      form.reset();
      onSuccess?.();
      handleClose();
    } catch (err) {
      setApiError(
        isApiError(err)
          ? err.message
          : "Failed to change password. Please try again.",
      );
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Change Password"
      description={`Set a new password for ${user.name}`}
      maxWidth="max-w-sm"
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {apiError && <ApiErrorBanner message={apiError} />}

        <div>
          <FormLabel required>New Password</FormLabel>
          <div className="relative">
            <Input
              {...form.register("newPassword")}
              type={showNew ? "text" : "password"}
              placeholder="Min. 6 characters"
              error={!!form.formState.errors.newPassword}
              disabled={mutation.isPending}
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              tabIndex={-1}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showNew ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <FieldError message={form.formState.errors.newPassword?.message} />
        </div>

        <div>
          <FormLabel required>Confirm Password</FormLabel>
          <div className="relative">
            <Input
              {...form.register("confirmPassword")}
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter new password"
              error={!!form.formState.errors.confirmPassword}
              disabled={mutation.isPending}
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              tabIndex={-1}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showConfirm ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <FieldError message={form.formState.errors.confirmPassword?.message} />
        </div>

        <p className="text-[11px] text-slate-500">
          Changing the password will revoke all active sessions for this user.
        </p>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={mutation.isPending}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            {mutation.isPending ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <KeyRound className="w-3.5 h-3.5" />
                Change Password
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
