"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Phone,
  KeyRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/stores/AuthContext";
import {
  useUsers,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/users";
import { UserModal, ChangePasswordModal } from "@/components/users/UserModal";
import type { User } from "@/types";
import { isApiError } from "@/lib/apiErrors";

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  color = "text-slate-900",
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
      <div className={`text-lg font-bold mt-0.5 ${color}`}>{value}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton rows
// ---------------------------------------------------------------------------

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100 last:border-0">
          {Array.from({ length: 6 }).map((__, j) => (
            <td key={j} className="py-2.5 px-4">
              <div className="h-3 rounded bg-slate-100 animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Delete confirmation modal
// ---------------------------------------------------------------------------

function DeleteConfirmModal({
  user,
  onCancel,
  onConfirm,
  isDeleting,
}: {
  user: User;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 p-5 space-y-3">
        <h4 className="font-bold text-slate-900 text-sm">Delete User</h4>
        <p className="text-xs text-slate-600">
          Delete <strong>{user.name}</strong>?{" "}
          <span className="text-slate-500">({user.email})</span> This is a soft
          delete — the account will be deactivated but data is preserved.
        </p>
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const PAGE_SIZE = 10;

export default function UsersPage() {
  const { user: currentUser } = useAuth();

  // ---- Pagination & filters (client-side filtering on current page data)
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ---- Modal state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToChangePassword, setUserToChangePassword] = useState<User | null>(null);

  // ---- Error banner for quick-actions (toggle status)
  const [actionError, setActionError] = useState("");

  // ---- Data
  const { data, isLoading, isFetching } = useUsers({ page, limit: PAGE_SIZE });
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const users = data?.data ?? [];
  const meta = data?.meta;

  // Client-side filter within the current page
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone?.toLowerCase().includes(q) ?? false);

      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchStatus = statusFilter === "ALL" || u.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // ---- Derived metrics from current page data
  const metrics = useMemo(() => {
    const all = data?.data ?? [];
    return {
      total: meta?.total ?? 0,
      active: all.filter((u) => u.status === "Active").length,
      inactive: all.filter((u) => u.status === "Inactive").length,
      admins: all.filter((u) => u.role === "Admin").length,
      salesmen: all.filter((u) => u.role === "Salesman").length,
    };
  }, [data, meta]);

  // ---- Handlers

  const openCreate = () => {
    setUserToEdit(null);
    setIsUserModalOpen(true);
  };

  const openEdit = (u: User) => {
    setUserToEdit(u);
    setIsUserModalOpen(true);
  };

  const handleToggleStatus = async (u: User) => {
    setActionError("");
    try {
      await updateMutation.mutateAsync({
        id: u.id,
        payload: { status: u.status === "Active" ? "Inactive" : "Active" },
      });
    } catch (err) {
      setActionError(isApiError(err) ? err.message : "Failed to update status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await deleteMutation.mutateAsync(userToDelete.id);
      setUserToDelete(null);
    } catch (err) {
      setUserToDelete(null);
      setActionError(isApiError(err) ? err.message : "Failed to delete user.");
    }
  };

  const isLoaderVisible = isLoading || (isFetching && users.length === 0);

  return (
    <div className="space-y-5 max-w-6xl">
      {/* ---- Header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            User Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage pharmacy salesmen and admin accounts.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="self-start sm:self-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* ---- Metrics ---- */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total Users" value={metrics.total} />
        <StatCard label="Active" value={metrics.active} color="text-emerald-600" />
        <StatCard label="Inactive" value={metrics.inactive} color="text-slate-500" />
        <StatCard label="Admins" value={metrics.admins} color="text-purple-600" />
        <div className="col-span-2 sm:col-span-1">
          <StatCard label="Salesmen" value={metrics.salesmen} color="text-sky-600" />
        </div>
      </div>

      {/* ---- Action error ---- */}
      {actionError && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError("")}
            className="ml-auto text-rose-400 hover:text-rose-600 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ---- Filters ---- */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or phone…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Salesman">Salesman</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* ---- Table ---- */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Thin loading bar at top while refetching */}
        {isFetching && !isLoaderVisible && (
          <div className="h-0.5 bg-emerald-500 animate-pulse" />
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Phone</th>
                <th className="py-2.5 px-4">Created</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoaderVisible ? (
                <TableSkeleton />
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center text-xs text-slate-400"
                  >
                    {searchTerm || roleFilter !== "ALL" || statusFilter !== "ALL"
                      ? "No users match the current filters."
                      : "No users found."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isActive = u.status === "Active";
                  const isCurrent = u.id === currentUser?.id;
                  const isTogglingStatus =
                    updateMutation.isPending &&
                    updateMutation.variables?.id === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      {/* Name / email */}
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {u.name}
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-medium">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 text-[11px]">{u.email}</div>
                      </td>

                      {/* Role */}
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            u.role === "Admin"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-sky-50 text-sky-700 border border-sky-200"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Status toggle */}
                      <td className="py-2.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          disabled={isTogglingStatus || isCurrent}
                          title={
                            isCurrent
                              ? "Cannot change your own status"
                              : "Click to toggle"
                          }
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {isTogglingStatus ? (
                            <span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? "bg-emerald-600" : "bg-slate-400"
                              }`}
                            />
                          )}
                          {isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Phone */}
                      <td className="py-2.5 px-4 text-slate-600">
                        {u.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {u.phone}
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Created at */}
                      <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString("en-GB")}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            onClick={() => openEdit(u)}
                            title="Edit user"
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setUserToChangePassword(u)}
                            title="Change password"
                            className="p-1.5 rounded hover:bg-amber-50 text-slate-400 hover:text-amber-600 cursor-pointer transition-colors"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setUserToDelete(u)}
                            disabled={isCurrent}
                            title={
                              isCurrent
                                ? "Cannot delete your own account"
                                : "Delete user"
                            }
                            className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ---- Pagination ---- */}
        {meta && meta.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">
              Page {meta.page} of {meta.totalPages} &middot; {meta.total} users
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!meta.hasPreviousPage || isFetching}
                className="p-1.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Page numbers — show up to 5 */}
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === meta.totalPages ||
                    Math.abs(p - page) <= 1,
                )
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                    acc.push("...");
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      disabled={isFetching}
                      className={`min-w-[28px] h-7 rounded border text-xs font-medium transition-colors cursor-pointer ${
                        item === page
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}

              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={!meta.hasNextPage || isFetching}
                className="p-1.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---- Modals ---- */}

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        userToEdit={userToEdit}
      />

      {userToChangePassword && (
        <ChangePasswordModal
          isOpen={!!userToChangePassword}
          onClose={() => setUserToChangePassword(null)}
          user={userToChangePassword}
        />
      )}

      {userToDelete && (
        <DeleteConfirmModal
          user={userToDelete}
          onCancel={() => setUserToDelete(null)}
          onConfirm={handleDeleteConfirm}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
