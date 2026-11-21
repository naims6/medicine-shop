"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { User, UserRole, UserStatus } from "@/types";
import { userRepository, CreateUserInput, UpdateUserInput } from "@/repositories/userRepository";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
  onSuccess: (savedUser: User) => void;
}

interface UserFormProps {
  userToEdit?: User | null;
  onClose: () => void;
  onSuccess: (savedUser: User) => void;
}

function UserForm({ userToEdit, onClose, onSuccess }: UserFormProps) {
  const isEditing = !!userToEdit;

  const [name, setName] = useState(userToEdit?.name || "");
  const [email, setEmail] = useState(userToEdit?.email || "");
  const [password, setPassword] = useState(userToEdit ? "" : "password123");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>(
    userToEdit?.role === "Admin" || (userToEdit?.role as string) === "admin"
      ? "Admin"
      : "Salesman"
  );
  const [status, setStatus] = useState<UserStatus>(
    userToEdit?.status === "Inactive" ? "Inactive" : "Active"
  );
  const [phone, setPhone] = useState(userToEdit?.phone || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Name is required.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Valid email is required.");
      return;
    }

    if (!isEditing && (!password || password.trim().length < 4)) {
      setErrorMsg("Password must be at least 4 characters.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditing && userToEdit) {
        const payload: UpdateUserInput = {
          name,
          email,
          role,
          status,
          phone,
        };
        if (password.trim()) {
          payload.password = password.trim();
        }
        const updated = await userRepository.updateUser(userToEdit.id, payload);
        onSuccess(updated);
      } else {
        const payload: CreateUserInput = {
          name,
          email,
          password: password.trim() || "password123",
          role,
          status,
          phone,
        };
        const created = await userRepository.createUser(payload);
        onSuccess(created);
      }

      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save user.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <label className="block font-semibold text-slate-700 mb-1">
          Full Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Email <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            required
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Phone</label>
          <input
            type="text"
            placeholder="+880 1..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-slate-700 mb-1">
          Password {!isEditing ? <span className="text-rose-500">*</span> : "(leave blank to keep current)"}
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required={!isEditing}
            placeholder={isEditing ? "••••••••" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 pr-9 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
          >
            <option value="Salesman">Salesman</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as UserStatus)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create User"}
        </button>
      </div>
    </form>
  );
}

export function UserModal({
  isOpen,
  onClose,
  userToEdit,
  onSuccess,
}: UserModalProps) {
  const isEditing = !!userToEdit;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit User" : "Add User"}
      maxWidth="max-w-md"
    >
      <UserForm
        key={userToEdit?.id ?? (isOpen ? "create" : "closed")}
        userToEdit={userToEdit}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Modal>
  );
}
