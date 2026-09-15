"use client";

import { useState, useTransition } from "react";
import {
  UserCog,
  Plus,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  User,
} from "lucide-react";
import { createStaffAccount, deleteStaffAccount } from "@/app/actions/staff";

interface StaffMember {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

interface StaffManagementClientProps {
  initialStaff: StaffMember[];
}

export function StaffManagementClient({ initialStaff }: StaffManagementClientProps) {
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    startTransition(async () => {
      const result = await createStaffAccount(form);
      if (result.success) {
        setFormSuccess(`Staff account created for ${result.email}`);
        setForm({ full_name: "", email: "", password: "" });
        setShowForm(false);
        // Refresh list by re-fetching (simple approach: add optimistically)
        setStaffList((prev) => [
          {
            id: Date.now().toString(), // temp id, page refresh will fix
            email: form.email,
            full_name: form.full_name,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setTimeout(() => setFormSuccess(""), 4000);
      } else {
        setFormError(result.error);
      }
    });
  };

  const handleDelete = async (userId: string) => {
    setDeletingId(userId);
    const result = await deleteStaffAccount(userId);
    setDeletingId(null);
    setConfirmDeleteId(null);
    if (result.success) {
      setStaffList((prev) => prev.filter((s) => s.id !== userId));
    } else {
      alert("Error: " + result.error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Success Banner */}
      {formSuccess && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm p-4 rounded-2xl border border-emerald-200">
          <CheckCircle2 size={16} className="shrink-0" />
          {formSuccess}
        </div>
      )}

      {/* Header action */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 font-medium">
          {staffList.length} staff member{staffList.length !== 1 ? "s" : ""}
        </p>
        <button
          type="button"
          onClick={() => { setShowForm(!showForm); setFormError(""); }}
          className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? "Cancel" : "Add Staff"}
        </button>
      </div>

      {/* Create Staff Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-gb-green flex items-center justify-center">
              <UserCog size={16} />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Create Staff Account</h3>
          </div>

          <form onSubmit={handleCreate} className="space-y-3 max-w-md">
            <div>
              <label className="gb-label text-xs">Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="e.g. Rajan Kumar"
                className="gb-input text-sm"
                required
                minLength={2}
                autoComplete="name"
              />
            </div>

            <div>
              <label className="gb-label text-xs">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="staff@greenbasket.in"
                className="gb-input text-sm"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="gb-label text-xs">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="gb-input text-sm pr-10"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {formError && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-200">
                <AlertCircle size={14} className="shrink-0" />
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full justify-center py-2.5 text-xs font-bold"
            >
              {isPending ? (
                <><Loader2 size={14} className="animate-spin" /> Creating Account…</>
              ) : (
                <><Plus size={14} /> Create Staff Account</>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Staff List */}
      {staffList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
          <UserCog size={36} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-bold text-gray-700 text-sm">No Staff Members Yet</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            Add your first staff member above. They will be able to manage orders, products, categories, and delivery areas.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-100">
            {staffList.map((staff) => (
              <div key={staff.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold text-sm">
                    {(staff.full_name || staff.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-gray-400" />
                      <p className="text-sm font-bold text-gray-900">
                        {staff.full_name || "—"}
                      </p>
                      <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full">
                        Staff
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Mail size={11} className="text-gray-400" />
                      <p className="text-xs text-gray-500 font-mono">{staff.email}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Added {new Date(staff.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* Delete confirm flow */}
                {confirmDeleteId === staff.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-600 font-semibold">Delete?</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(staff.id)}
                      disabled={deletingId === staff.id}
                      className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl transition-colors"
                    >
                      {deletingId === staff.id ? <Loader2 size={12} className="animate-spin" /> : "Yes, Delete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(staff.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remove staff member"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Access info */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 space-y-1">
        <p className="font-bold">Staff Access Permissions</p>
        <p>✅ Can access: Orders, Products, Categories, Delivery Areas</p>
        <p>❌ Cannot access: Revenue Dashboard, Customers, Settings, Banners, Staff Management</p>
      </div>
    </div>
  );
}
