"use client";

import React, { useState, useMemo } from "react";
import { Users, UserPlus, Search, Filter, Edit2, Trash2, Phone, KeyRound, AlertCircle, X } from "lucide-react";

import { useAuth } from "@/stores/AuthContext";
import { useUsers, useUpdateUser, useDeleteUser } from "@/hooks/users";
import { UserModal, ChangePasswordModal } from "@/components/users/UserModal";
import { AdminOnly } from "@/components/shared/AdminOnly";
import { DeleteConfirmModal } from "@/components/shared/DeleteConfirmModal";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { DataTable } from "@/components/shared/DataTable";
import { StatCard } from "@/components/shared/StatCard";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TableRow, TableCell } from "@/components/ui/table";

import type { User } from "@/types";
import { isApiError } from "@/lib/apiErrors";

const PAGE_SIZE = 10;

const COLUMNS = [
  { key: "user",    label: "User" },
  { key: "role",    label: "Role" },
  { key: "status",  label: "Status" },
  { key: "phone",   label: "Phone" },
  { key: "created", label: "Created" },
  { key: "actions", label: "Actions", className: "text-right" },
];

// ---------------------------------------------------------------------------
// UserRow
// ---------------------------------------------------------------------------
interface UserRowProps {
  user: User;
  isCurrent: boolean;
  isTogglingStatus: boolean;
  onEdit: (u: User) => void;
  onChangePassword: (u: User) => void;
  onDelete: (u: User) => void;
  onToggleStatus: (u: User) => void;
}

function UserRow({ user: u, isCurrent, isTogglingStatus, onEdit, onChangePassword, onDelete, onToggleStatus }: UserRowProps) {
  const isActive = u.status === "Active";

  return (
    <TableRow key={u.id}>
      {/* Name + email */}
      <TableCell>
        <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
          {u.name}
          {isCurrent && <Badge variant="secondary" className="text-[10px]">You</Badge>}
        </div>
        <div className="text-[11px] text-slate-400">{u.email}</div>
      </TableCell>

      {/* Role */}
      <TableCell>
        <Badge variant={u.role === "Admin" ? "purple" : "info"}>{u.role}</Badge>
      </TableCell>

      {/* Status toggle */}
      <TableCell>
        <button
          type="button"
          onClick={() => onToggleStatus(u)}
          disabled={isTogglingStatus || isCurrent}
          title={isCurrent ? "Cannot change your own status" : "Click to toggle"}
          className="inline-flex disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Badge variant={isActive ? "success" : "secondary"} className="gap-1.5">
            {isTogglingStatus
              ? <span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin" />
              : <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-600" : "bg-slate-400"}`} />
            }
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </button>
      </TableCell>

      {/* Phone */}
      <TableCell className="text-xs text-slate-600">
        {u.phone
          ? <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" />{u.phone}</span>
          : <span className="text-slate-300">—</span>
        }
      </TableCell>

      {/* Created */}
      <TableCell className="text-[11px] text-slate-500">
        {new Date(u.createdAt).toLocaleDateString("en-GB")}
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-0.5">
          <Button variant="ghost" size="icon-sm" onClick={() => onEdit(u)} title="Edit">
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => onChangePassword(u)} title="Change password"
            className="hover:bg-amber-50 hover:text-amber-600 text-slate-400">
            <KeyRound className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => onDelete(u)} disabled={isCurrent} title={isCurrent ? "Cannot delete yourself" : "Delete"}
            className="hover:bg-rose-50 hover:text-rose-600 text-slate-400">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function UsersPage() {
  const { user: currentUser } = useAuth();

  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState("");
  const [roleFilter, setRoleFilter]   = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen]             = useState(false);
  const [userToEdit, setUserToEdit]           = useState<User | null>(null);
  const [userToDelete, setUserToDelete]       = useState<User | null>(null);
  const [userToPassword, setUserToPassword]   = useState<User | null>(null);
  const [actionError, setActionError]         = useState("");

  const { data, isLoading, isFetching } = useUsers({ page, limit: PAGE_SIZE, search: search.trim() || undefined, role: roleFilter, status: statusFilter });
  const updateMutation  = useUpdateUser();
  const deleteMutation  = useDeleteUser();

  const users = useMemo(() => data?.data ?? [], [data]);
  const meta  = data?.meta;

  const metrics = useMemo(() => ({
    total:    meta?.total ?? 0,
    active:   users.filter((u) => u.status === "Active").length,
    inactive: users.filter((u) => u.status === "Inactive").length,
    admins:   users.filter((u) => u.role === "Admin").length,
    salesmen: users.filter((u) => u.role === "Salesman").length,
  }), [users, meta]);

  const openCreate = () => { setUserToEdit(null); setModalOpen(true); };
  const openEdit   = (u: User) => { setUserToEdit(u); setModalOpen(true); };

  const handleToggleStatus = async (u: User) => {
    setActionError("");
    try {
      await updateMutation.mutateAsync({ id: u.id, payload: { status: u.status === "Active" ? "Inactive" : "Active" } });
    } catch (err) {
      setActionError(isApiError(err) ? err.message : "Failed to update status.");
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setActionError("");
    try {
      await deleteMutation.mutateAsync(userToDelete.id);
      setUserToDelete(null);
    } catch (err) {
      setUserToDelete(null);
      setActionError(isApiError(err) ? err.message : "Failed to delete user.");
    }
  };

  return (
    <AdminOnly>
    <div className="space-y-5 max-w-6xl">

      <PageHeader
        title="User Management"
        description="Manage pharmacy salesmen and admin accounts."
        icon={<Users className="w-5 h-5 text-emerald-600" />}
        action={<Button onClick={openCreate}><UserPlus className="w-4 h-4" />Add User</Button>}
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total"    value={metrics.total} />
        <StatCard label="Active"   value={metrics.active}   color="text-emerald-600" />
        <StatCard label="Inactive" value={metrics.inactive} color="text-slate-500" />
        <StatCard label="Admins"   value={metrics.admins}   color="text-purple-600" />
        <div className="col-span-2 sm:col-span-1">
          <StatCard label="Salesmen" value={metrics.salesmen} color="text-sky-600" />
        </div>
      </div>

      {/* Error */}
      {actionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {actionError}
            <button type="button" onClick={() => setActionError("")} className="text-rose-400 hover:text-rose-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="py-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input placeholder="Search name, email, phone…" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
              <SelectTrigger className="w-32"><SelectValue placeholder="All Roles" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Salesman">Salesman</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-32"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <DataTable
        columns={COLUMNS}
        data={users}
        loading={isLoading}
        fetching={isFetching}
        emptyMessage={search || roleFilter !== "ALL" || statusFilter !== "ALL" ? "No users match the current filters." : "No users found."}
        renderRow={(u) => (
          <UserRow
            key={u.id}
            user={u}
            isCurrent={u.id === currentUser?.id}
            isTogglingStatus={updateMutation.isPending && updateMutation.variables?.id === u.id}
            onEdit={openEdit}
            onChangePassword={setUserToPassword}
            onDelete={setUserToDelete}
            onToggleStatus={handleToggleStatus}
          />
        )}
        footer={meta && <Pagination meta={meta} page={page} onPageChange={setPage} isFetching={isFetching} itemLabel="users" />}
      />

      {/* Modals */}
      <UserModal isOpen={modalOpen} onClose={() => setModalOpen(false)} userToEdit={userToEdit} />

      {userToPassword && (
        <ChangePasswordModal isOpen onClose={() => setUserToPassword(null)} user={userToPassword} />
      )}

      {userToDelete && (
        <DeleteConfirmModal
          isOpen
          title="Delete User"
          description={<p>Are you sure you want to delete <strong>{userToDelete.name}</strong>? This action cannot be undone.</p>}
          onCancel={() => setUserToDelete(null)}
          onConfirm={handleDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
    </AdminOnly>
  );
}
