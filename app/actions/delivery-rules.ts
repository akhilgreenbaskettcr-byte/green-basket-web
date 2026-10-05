"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

const money = z.coerce.number().min(0, "Must be 0 or more").max(1_000_000);
const km = z.coerce.number().min(0, "Must be 0 or more").max(1000);

const RuleSchema = z
  .object({
    min_order: money,
    max_order: z
      .union([z.literal(""), z.null(), z.undefined(), money])
      .transform((v) => (v === "" || v === null || v === undefined ? null : Number(v))),
    free_distance_km: km,
    base_charge: money,
    per_km_charge: money,
    extra_after_km: km.optional(),
    is_active: z.boolean().default(true),
  })
  .transform((r) => ({
    ...r,
    extra_after_km: r.extra_after_km ?? r.free_distance_km,
  }))
  .refine((r) => r.max_order === null || r.max_order > r.min_order, {
    message: "Max Order Value must be greater than Min Order Value",
    path: ["max_order"],
  });

export type DeliveryRuleInput = z.input<typeof RuleSchema>;
export type DeliveryRuleActionResult = { success: true } | { success: false; error: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const };
  const { data: profile } = await (supabase as any).from("profiles").select("role").eq("id", user.id).single();
  return { supabase, ok: profile?.role === "admin" };
}

function friendlyDbError(error: { code?: string; message: string }): string {
  if (error.code === "23P01") return "This order-value range overlaps an existing active rule.";
  if (error.code === "23514") return "One or more values are invalid.";
  return error.message;
}

function revalidate() {
  revalidatePath("/admin/settings", "page");
}

export async function saveDeliveryRule(
  input: DeliveryRuleInput,
  id?: string
): Promise<DeliveryRuleActionResult> {
  const parsed = RuleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid rule" };
  }

  const { supabase, ok } = await requireAdmin();
  if (!ok) return { success: false, error: "Forbidden: admin only" };

  const query = id
    ? (supabase as any).from("delivery_pricing_rules").update(parsed.data).eq("id", id)
    : (supabase as any).from("delivery_pricing_rules").insert(parsed.data);

  const { error } = await query;
  if (error) return { success: false, error: friendlyDbError(error) };

  revalidate();
  return { success: true };
}

export async function deleteDeliveryRule(id: string): Promise<DeliveryRuleActionResult> {
  if (!z.string().uuid().safeParse(id).success) return { success: false, error: "Invalid rule" };

  const { supabase, ok } = await requireAdmin();
  if (!ok) return { success: false, error: "Forbidden: admin only" };

  const { error } = await (supabase as any).from("delivery_pricing_rules").delete().eq("id", id);
  if (error) return { success: false, error: friendlyDbError(error) };

  revalidate();
  return { success: true };
}

export async function listDeliveryRules() {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return [];
  const { data } = await (supabase as any)
    .from("delivery_pricing_rules")
    .select("*")
    .order("min_order", { ascending: true });
  return (data ?? []) as import("@/types/database").DeliveryPricingRule[];
}
