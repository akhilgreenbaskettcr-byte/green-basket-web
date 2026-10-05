"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import type { DeliveryPricingRule } from "@/types/database";
import {
  deleteDeliveryRule,
  listDeliveryRules,
  saveDeliveryRule,
} from "@/app/actions/delivery-rules";

interface Props {
  initialRules: DeliveryPricingRule[];
}

interface FormState {
  min_order: string;
  max_order: string;
  free_distance_km: string;
  base_charge: string;
  per_km_charge: string;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  min_order: "0",
  max_order: "",
  free_distance_km: "0",
  base_charge: "0",
  per_km_charge: "0",
  is_active: true,
};

const FIELDS: { key: keyof Omit<FormState, "is_active">; label: string; hint?: string }[] = [
  { key: "min_order", label: "Min Order Value (₹)" },
  { key: "max_order", label: "Max Order Value (₹)", hint: "Leave empty for no upper limit" },
  { key: "free_distance_km", label: "Free Delivery Distance (km)", hint: "0 = never free by distance" },
  { key: "base_charge", label: "Base Delivery Charge (₹)" },
  { key: "per_km_charge", label: "Additional Charge per km (₹)", hint: "Calculated automatically after free distance" },
];

const fmt = (n: number) => `₹${Number(n)}`;

/**
 * Admin CRUD for `delivery_pricing_rules`.
 * Persists via validated server actions (not the bulk settings upsert) and renders its modal in a
 * portal, since the surrounding settings tab lives inside a <form>.
 */
export function DeliveryPricingRulesEditor({ initialRules }: Props) {
  const [rules, setRules] = useState(initialRules);
  const [editing, setEditing] = useState<DeliveryPricingRule | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [pageError, setPageError] = useState("");
  const [isPending, startTransition] = useTransition();

  const refresh = async () => setRules(await listDeliveryRules());

  const openNew = () => {
    setForm(EMPTY_FORM);
    setError("");
    setEditing("new");
  };

  const openEdit = (r: DeliveryPricingRule) => {
    setForm({
      min_order: String(r.min_order),
      max_order: r.max_order === null ? "" : String(r.max_order),
      free_distance_km: String(r.free_distance_km),
      base_charge: String(r.base_charge),
      per_km_charge: String(r.per_km_charge),
      is_active: r.is_active,
    });
    setError("");
    setEditing(r);
  };

  const submit = () => {
    setError("");
    startTransition(async () => {
      const res = await saveDeliveryRule(form, editing && editing !== "new" ? editing.id : undefined);
      if (!res.success) {
        setError(res.error);
        return;
      }
      await refresh();
      setEditing(null);
    });
  };

  const remove = (r: DeliveryPricingRule) => {
    if (!window.confirm("Delete this delivery pricing rule?")) return;
    setPageError("");
    startTransition(async () => {
      const res = await deleteDeliveryRule(r.id);
      if (!res.success) {
        setPageError(res.error);
        return;
      }
      await refresh();
    });
  };

  return (
    <div className="sm:col-span-2 pt-4 border-t border-gray-100 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gb-charcoal">Delivery Pricing Rules</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Rules are matched by cart value (before GST) and applied using driving distance from the store.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gb-green text-white hover:opacity-90 shrink-0"
        >
          <Plus size={14} /> Add Rule
        </button>
      </div>

      {pageError && <p className="text-xs text-red-600">{pageError}</p>}

      {rules.length === 0 ? (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4">
          No pricing rules configured. Checkout will be unavailable for orders without a matching rule.
        </p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rules.map((r) => (
            <li
              key={r.id}
              className={`rounded-2xl border p-4 space-y-2 ${r.is_active ? "border-gray-200 bg-white" : "border-dashed border-gray-300 bg-gray-50 opacity-70"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-gb-charcoal">
                  {fmt(r.min_order)} – {r.max_order === null ? "No limit" : fmt(r.max_order)}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(r)}
                    className="p-1.5 rounded-lg hover:bg-gray-100"
                    aria-label="Edit rule"
                  >
                    <Pencil size={14} className="text-gray-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(r)}
                    disabled={isPending}
                    className="p-1.5 rounded-lg hover:bg-red-50"
                    aria-label="Delete rule"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                <dt>Free delivery distance</dt>
                <dd className="font-semibold text-gb-charcoal">{Number(r.free_distance_km)} km</dd>
                <dt>Base charge</dt>
                <dd className="font-semibold text-gb-charcoal">{fmt(r.base_charge)}</dd>
                <dt>Additional per km</dt>
                <dd className="font-semibold text-gb-charcoal">
                  {Number(r.per_km_charge) > 0
                    ? `${fmt(r.per_km_charge)} / km (after ${Number(r.free_distance_km)} km)`
                    : "₹0"}
                </dd>
              </dl>
              {!r.is_active && <p className="text-[11px] font-semibold text-gray-500">Inactive</p>}
            </li>
          ))}
        </ul>
      )}

      {editing !== null &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={editing === "new" ? "Add delivery rule" : "Edit delivery rule"}
          >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gb-charcoal">
                  {editing === "new" ? "Add Delivery Rule" : "Edit Delivery Rule"}
                </h3>
                <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FIELDS.map(({ key, label, hint }) => (
                  <div key={key}>
                    <label className="gb-label" htmlFor={`rule-${key}`}>{label}</label>
                    <input
                      id={`rule-${key}`}
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="gb-input"
                    />
                    {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
                  </div>
                ))}
              </div>

              <label className="flex items-center gap-2 text-sm text-gb-charcoal">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
                Rule is active
              </label>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gb-green text-white hover:opacity-90 disabled:opacity-60"
                >
                  {isPending && <Loader2 size={14} className="animate-spin" />}
                  Save Rule
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
