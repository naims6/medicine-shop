"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { User } from "@/types";
import { userRepository } from "@/repositories/userRepository";
import { useAuth } from "@/stores/AuthContext";
import { UserModal } from "@/components/users/UserModal";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Phone,
  RotateCcw,
} from "lucide-react";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const refreshUsers = useCallback(async () => {
    try {
      const data = await userRepository.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    userRepository
      .getAllUsers()
      .then((data) => {
        if (isMounted) {
          setUsers(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load users:", err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q));

      const normRole = (u.role === "admin" || u.role === "Admin") ? "Admin" : "Salesman";
      const matchRole = roleFilter === "ALL" || normRole === roleFilter;

      const normStatus = u.status === "Inactive" ? "Inactive" : "Active";
      const matchStatus = statusFilter === "ALL" || normStatus === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const metrics = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status !== "Inactive").length;
    const inactive = users.filter((u) => u.status === "Inactive").length;
    const admins = users.filter((u) => u.role === "Admin" || (u.role as string) === "admin").length;
    const salesmen = users.filter((u) => u.role === "Salesman" || (u.role as string) === "cashier").length;
    return { total, active, inactive, admins, salesmen };
  }, [users]);

  const handleToggleStatus = async (u: User) => {
    try {
      const updated = await userRepository.toggleUserStatus(u.id);
      setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    if (userToDelete.id === currentUser?.id) {
      alert("You cannot delete your own account.");
      setUserToDelete(null);
      return;
    }

    try {
      await userRepository.deleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((item) => item.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetUsers = async () => {
    if (confirm("Reset to 5 initial users?")) {
      await userRepository.resetToDefault();
      await refreshUsers();
    }
  };

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
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

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetUsers}
            title="Reset to 5 default users"
            className="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={() => {
              setUserToEdit(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Total Users</span>
          <div className="text-lg font-bold text-slate-900 mt-0.5">{metrics.total}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Active</span>
          <div className="text-lg font-bold text-emerald-600 mt-0.5">{metrics.active}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Inactive</span>
          <div className="text-lg font-bold text-slate-500 mt-0.5">{metrics.inactive}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Admins</span>
          <div className="text-lg font-bold text-purple-600 mt-0.5">{metrics.admins}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-medium text-slate-500">Salesmen</span>
          <div className="text-lg font-bold text-sky-600 mt-0.5">{metrics.salesmen}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Salesman">Salesman</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">No users found.</div>
        ) : (
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
                {filteredUsers.map((u) => {
                  const roleNormalized =
                    u.role === "Admin" || (u.role as string) === "admin" ? "Admin" : "Salesman";
                  const isActive = u.status === "Active";
                  const isCurrent = u.id === currentUser?.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {u.name}
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 text-[11px]">{u.email}</div>
                      </td>

                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            roleNormalized === "Admin"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-sky-50 text-sky-700 border border-sky-200"
                          }`}
                        >
                          {roleNormalized}
                        </span>
                      </td>

                      <td className="py-2.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-600" : "bg-slate-400"
                            }`}
                          />
                          <span>{isActive ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      <td className="py-2.5 px-4 text-slate-600">
                        {u.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{u.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-GB") : "-"}
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setUserToEdit(u);
                              setIsModalOpen(true);
                            }}
                            title="Edit"
                            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setUserToDelete(u)}
                            disabled={isCurrent}
                            title="Delete"
                            className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={userToEdit}
        onSuccess={(savedUser) => {
          if (userToEdit) {
            setUsers((prev) => prev.map((item) => (item.id === savedUser.id ? savedUser : item)));
          } else {
            setUsers((prev) => [savedUser, ...prev]);
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setUserToDelete(null)}
          />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 p-5 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Delete User</h4>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong>{userToDelete.name}</strong> ({userToDelete.email})?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
