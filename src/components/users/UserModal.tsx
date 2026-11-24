"use client";

import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from "@/components/ui/dialog";

import { UserForm } from "./UserForm";
import { ChangePasswordForm } from "./ChangePasswordForm";

import { useCreateUser } from "@/hooks/users/useCreateUser";
import { useUpdateUser } from "@/hooks/users/useUpdateUser";
import { useChangePassword } from "@/hooks/users/useChangePassword";
import type { User } from "@/types";
import type { UserFormData, ChangePasswordFormData } from "@/schemas/user.schema";
import { isApiError } from "@/lib/apiErrors";

// ---------------------------------------------------------------------------
// UserModal — Create / Edit
// ---------------------------------------------------------------------------

export interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
  onSuccess?: () => void;
}

export function UserModal({ isOpen, onClose, userToEdit, onSuccess }: UserModalProps) {
  const isEditing = !!userToEdit;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const [apiError, setApiError] = useState("");

  const handleClose = () => {
    setApiError("");
    onClose();
  };

  const handleSubmit = async (data: UserFormData) => {
    setApiError("");
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: userToEdit.id,
          payload: { name: data.name, email: data.email, role: data.role, status: data.status, phone: data.phone || undefined },
        });
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          email: data.email,
          password: data.password ?? "",
          role: data.role,
          status: data.status,
          phone: data.phone || undefined,
        });
      }
      onSuccess?.();
      handleClose();
    } catch (err) {
      setApiError(isApiError(err) ? err.message : `Failed to ${isEditing ? "update" : "create"} user.`);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-full max-w-md p-0">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Add User"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the user's profile. Use the key icon to change their password."
              : "Create a new user account for the pharmacy system."}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <UserForm
            mode={isEditing ? "edit" : "create"}
            user={userToEdit ?? undefined}
            isPending={isPending}
            apiError={apiError}
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// ChangePasswordModal
// ---------------------------------------------------------------------------

export interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSuccess?: () => void;
}

export function ChangePasswordModal({ isOpen, onClose, user, onSuccess }: ChangePasswordModalProps) {
  const mutation = useChangePassword();
  const [apiError, setApiError] = useState("");

  const handleClose = () => {
    setApiError("");
    onClose();
  };

  const handleSubmit = async (data: ChangePasswordFormData) => {
    setApiError("");
    try {
      await mutation.mutateAsync({ id: user.id, payload: { newPassword: data.newPassword } });
      onSuccess?.();
      handleClose();
    } catch (err) {
      setApiError(isApiError(err) ? err.message : "Failed to change password.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-full max-w-sm p-0">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>Set a new password for {user.name}</DialogDescription>
        </DialogHeader>

        <DialogBody>
          <ChangePasswordForm
            isPending={mutation.isPending}
            apiError={apiError}
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
