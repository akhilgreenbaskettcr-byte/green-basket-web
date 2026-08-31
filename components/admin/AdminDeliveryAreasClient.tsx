"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Loader2,
  Plus,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Edit3,
  Trash2,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import type { DeliveryArea } from "@/types/database";

interface AdminDeliveryAreasClientProps {
  deliveryAreas: DeliveryArea[];
}

interface DeliveryAreaFormData {
  area_name: string;
  pincode: string;
}

export function AdminDeliveryAreasClient({
  deliveryAreas,
}: AdminDeliveryAreasClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingArea, setEditingArea] = useState<DeliveryArea | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [createForm, setCreateForm] = useState<DeliveryAreaFormData>({
    area_name: "",
    pincode: "",
  });

  const [editForm, setEditForm] = useState<DeliveryAreaFormData>({
    area_name: "",
    pincode: "",
  });

  const validatePincode = (pincode: string) => {
    return /^\d{6}$/.test(pincode.trim());
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedArea = createForm.area_name.trim();
    const trimmedPin = createForm.pincode.trim();

    if (!trimmedArea) return setError("Area name is required.");
    if (!validatePincode(trimmedPin)) {
      return setError("PIN code must be exactly 6 digits.");
    }

    // Check duplicate in client state
    const isDuplicate = deliveryAreas.some(
      (da) => da.pincode === trimmedPin && da.area_name.toLowerCase() === trimmedArea.toLowerCase()
    );
    if (isDuplicate) {
      return setError(`Delivery area "${trimmedArea} (${trimmedPin})" already exists.`);
    }

    startTransition(async () => {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any).from("delivery_areas").insert({
        area_name: trimmedArea,
        pincode: trimmedPin,
        is_active: true,
      });

      if (dbError) {
        if (dbError.code === "23505") {
          setError(`Delivery area with PIN code ${trimmedPin} and name "${trimmedArea}" already exists.`);
        } else {
          setError(dbError.message);
        }
        return;
      }

      setCreateForm({ area_name: "", pincode: "" });
      setShowCreateForm(false);
      setSuccessMessage(`Added "${trimmedArea} (${trimmedPin})" successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      router.refresh();
    });
  };

  const openEditModal = (area: DeliveryArea) => {
    setEditingArea(area);
    setEditForm({
      area_name: area.area_name,
      pincode: area.pincode,
    });
    setError("");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArea) return;
    setError("");

    const trimmedArea = editForm.area_name.trim();
    const trimmedPin = editForm.pincode.trim();

    if (!trimmedArea) return setError("Area name is required.");
    if (!validatePincode(trimmedPin)) {
      return setError("PIN code must be exactly 6 digits.");
    }

    startTransition(async () => {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any)
        .from("delivery_areas")
        .update({
          area_name: trimmedArea,
          pincode: trimmedPin,
        })
        .eq("id", editingArea.id);

      if (dbError) {
        setError(dbError.message);
        return;
      }

      setEditingArea(null);
      setSuccessMessage(`Updated delivery area "${trimmedArea}" successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      router.refresh();
    });
  };

  const toggleActive = async (id: string, current: boolean) => {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("delivery_areas").update({ is_active: !current }).eq("id", id);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any)
        .from("delivery_areas")
        .delete()
        .eq("id", id);

      if (dbError) {
        setError(dbError.message);
        return;
      }

      setDeletingId(null);
      setSuccessMessage("Delivery area deleted successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-gb-green shrink-0 border border-green-100">
            <MapPin size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Delivery Areas &amp; PIN Codes</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage eligible 6-digit postal PIN codes where Green Basket delivers.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setError("");
          }}
          className="btn-primary text-xs flex items-center gap-1.5 px-4 py-2.5 shrink-0"
        >
          <Plus size={16} /> Add Delivery Area
        </button>
      </div>

      {/* Top Banner Success Message */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-2xl flex items-center gap-2">
          <Check size={16} className="text-emerald-600 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Add New Area Form Card */}
      {showCreateForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Plus size={16} className="text-gb-green" /> Add New Delivery Area
            </h2>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="area-name" className="gb-label">
                  Area / Locality Name *
                </label>
                <input
                  id="area-name"
                  type="text"
                  value={createForm.area_name}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, area_name: e.target.value }))
                  }
                  className="gb-input"
                  placeholder="e.g. Edappally"
                  required
                />
              </div>

              <div>
                <label htmlFor="area-pincode" className="gb-label">
                  6-Digit PIN Code *
                </label>
                <input
                  id="area-pincode"
                  type="text"
                  maxLength={6}
                  value={createForm.pincode}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, "") }))
                  }
                  className="gb-input font-mono text-sm tracking-wider"
                  placeholder="682024"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="btn-primary text-xs px-5 py-2.5"
              >
                {isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Adding…
                  </>
                ) : (
                  "Add Delivery Area"
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-4 py-2.5"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delivery Areas Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Active &amp; Configured PIN Codes</h3>
            <p className="text-xs text-gray-500">
              Total areas: {deliveryAreas.length} | Active: {deliveryAreas.filter((a) => a.is_active).length}
            </p>
          </div>
        </div>

        {deliveryAreas.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-2">
            <MapPin size={36} className="mx-auto text-gray-300 stroke-[1.5]" />
            <p className="font-semibold text-gray-600 text-sm">No delivery areas configured yet.</p>
            <p className="text-xs max-w-sm mx-auto">
              Add your first delivery area and PIN code above to allow customers to place orders in checkout.
            </p>
          </div>
        ) : (
          <table className="w-full" aria-label="Delivery areas list">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">
                  Area / Locality
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">
                  PIN Code
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">
                  Status
                </th>
                <th className="text-right text-xs font-semibold text-gray-500 px-6 py-3.5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {deliveryAreas.map((area) => (
                <tr key={area.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-gb-green flex items-center justify-center font-bold text-xs shrink-0">
                        📍
                      </div>
                      <span className="text-sm font-bold text-gray-900">{area.area_name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-bold bg-gray-100 text-gray-800 px-2.5 py-1 rounded-md tracking-wider border border-gray-200">
                      {area.pincode}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(area.id, area.is_active)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                        area.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-400"
                      }`}
                      aria-label={area.is_active ? "Deactivate area" : "Activate area"}
                    >
                      {area.is_active ? (
                        <ToggleRight size={16} className="text-green-600" />
                      ) : (
                        <ToggleLeft size={16} className="text-gray-400" />
                      )}
                      {area.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(area)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gb-green bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => setDeletingId(area.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editingArea && (
        <div
          className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-xs text-gray-400 font-mono">Delivery Area Editor</span>
                <h3 className="text-base font-bold text-gray-900">
                  Edit &ldquo;{editingArea.area_name}&rdquo;
                </h3>
              </div>
              <button
                onClick={() => setEditingArea(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="gb-label">Area / Locality Name *</label>
                <input
                  type="text"
                  value={editForm.area_name}
                  onChange={(e) => setEditForm((p) => ({ ...p, area_name: e.target.value }))}
                  className="gb-input"
                  required
                />
              </div>

              <div>
                <label className="gb-label">6-Digit PIN Code *</label>
                <input
                  type="text"
                  maxLength={6}
                  value={editForm.pincode}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, "") }))
                  }
                  className="gb-input font-mono text-sm tracking-wider"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingArea(null)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 px-3 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary text-xs px-5 py-2.5 shadow-sm"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingId && (
        <div
          className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Delete Delivery Area?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to remove this delivery PIN code? Customers in this PIN code will no longer be able to place orders.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="w-full text-xs font-semibold text-gray-600 hover:bg-gray-100 py-2.5 rounded-xl transition-colors border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(deletingId)}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
