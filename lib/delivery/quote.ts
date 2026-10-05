/**
 * Server-side delivery quote service — the single source of truth for delivery
 * eligibility, delivery charge and order totals. Used by:
 *   - POST /api/delivery/quote        (checkout preview)
 *   - POST /api/razorpay/create-order (amount authority)
 *   - createOrder server action       (persisted order values)
 *
 * Flow: coordinates → PIN → eligibility → distance → rule → charge → totals.
 * The client-supplied price / GST / delivery fee are NEVER trusted.
 */
import { createAdminClient } from "@/utils/supabase/admin";
import { getDrivingDistanceKm, DistanceUnavailableError } from "./distance";
import { isValidCoordinates, reverseGeocodePin, type Coordinates } from "./geo";
import {
  calculateDeliveryCharge,
  NoDeliveryRuleError,
  parseFreeDeliveryConfig,
  round2,
  type DeliveryRule,
} from "./pricing";

export interface QuoteItemInput {
  variantId: string;
  quantity: number;
}

export interface PricedItem {
  productId: string;
  variantId: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  gstPercentage: number;
  gstAmount: number;
}

export type QuoteFailureReason =
  | "invalid_location"
  | "empty_cart"
  | "invalid_items"
  | "area_unavailable"
  | "pin_unresolved"
  | "store_not_configured"
  | "service_unavailable";

export type DeliveryQuote =
  | {
      available: true;
      lat: number;
      lng: number;
      pincode: string;
      areaName: string;
      /** Internal only — never expose to customers. */
      distanceKm: number;
      ruleId: string | null;
      items: PricedItem[];
      subtotal: number;
      gstTotal: number;
      deliveryCharge: number;
      total: number;
    }
  | { available: false; reason: QuoteFailureReason };

const fail = (reason: QuoteFailureReason): DeliveryQuote => ({ available: false, reason });

/* eslint-disable @typescript-eslint/no-explicit-any */

async function priceItems(db: any, items: QuoteItemInput[]): Promise<PricedItem[] | null> {
  const merged = new Map<string, number>();
  for (const it of items) {
    if (!it?.variantId || !Number.isInteger(it.quantity) || it.quantity <= 0) return null;
    merged.set(it.variantId, (merged.get(it.variantId) ?? 0) + it.quantity);
  }

  const { data, error } = await db
    .from("product_variants")
    .select(
      "id, price, product_id, products:product_id(category_id, categories:category_id(gst_enabled, gst_percentage))"
    )
    .in("id", [...merged.keys()]);

  if (error || !data || data.length !== merged.size) return null;

  return data.map((v: any): PricedItem => {
    const quantity = merged.get(v.id) as number;
    const unitPrice = Number(v.price);
    const lineTotal = round2(unitPrice * quantity);
    const cat = v.products?.categories;
    const gstPercentage = cat?.gst_enabled && Number(cat.gst_percentage) > 0 ? Number(cat.gst_percentage) : 0;
    return {
      productId: v.product_id,
      variantId: v.id,
      unitPrice,
      quantity,
      lineTotal,
      gstPercentage,
      gstAmount: round2((unitPrice * quantity * gstPercentage) / 100),
    };
  });
}

export async function getDeliveryQuote(input: {
  lat: unknown;
  lng: unknown;
  items: QuoteItemInput[];
}): Promise<DeliveryQuote> {
  if (!isValidCoordinates(input.lat, input.lng)) return fail("invalid_location");
  const customer: Coordinates = { lat: input.lat as number, lng: input.lng as number };
  if (!Array.isArray(input.items) || input.items.length === 0) return fail("empty_cart");

  try {
    const db: any = createAdminClient();

    const priced = await priceItems(db, input.items);
    if (!priced) return fail("invalid_items");

    const subtotal = round2(priced.reduce((s, i) => s + i.lineTotal, 0));
    const gstTotal = round2(priced.reduce((s, i) => s + i.gstAmount, 0));

    // PIN + eligibility
    const geo = await reverseGeocodePin(customer);
    if (!geo) return fail("pin_unresolved");

    const { data: area } = await db
      .from("delivery_areas")
      .select("pincode, area_name")
      .eq("pincode", geo.pincode)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    if (!area) return fail("area_unavailable");

    // Store origin + free-delivery config
    const { data: settingRows } = await db
      .from("site_settings")
      .select("key, value")
      .in("key", ["store_lat", "store_lng", "free_delivery_enabled", "free_delivery_min_order"]);
    const settings: Record<string, string> = {};
    for (const r of settingRows ?? []) settings[r.key] = r.value ?? "";

    const storeLat = parseFloat(settings.store_lat);
    const storeLng = parseFloat(settings.store_lng);
    if (!isValidCoordinates(storeLat, storeLng)) return fail("store_not_configured");

    const distanceKm = await getDrivingDistanceKm({ lat: storeLat, lng: storeLng }, customer);

    const { data: ruleRows } = await db
      .from("delivery_pricing_rules")
      .select("id, min_order, max_order, free_distance_km, base_charge, per_km_charge, extra_after_km")
      .eq("is_active", true);
    const rules: DeliveryRule[] = (ruleRows ?? []).map((r: any) => ({
      id: r.id,
      min_order: Number(r.min_order),
      max_order: r.max_order === null ? null : Number(r.max_order),
      free_distance_km: Number(r.free_distance_km),
      base_charge: Number(r.base_charge),
      per_km_charge: Number(r.per_km_charge),
      extra_after_km: Number(r.extra_after_km),
    }));

    const result = calculateDeliveryCharge({
      subtotal,
      distanceKm,
      rules,
      freeDelivery: parseFreeDeliveryConfig(settings),
    });

    return {
      available: true,
      lat: customer.lat,
      lng: customer.lng,
      pincode: area.pincode,
      areaName: area.area_name,
      distanceKm,
      ruleId: result.rule?.id ?? null,
      items: priced,
      subtotal,
      gstTotal,
      deliveryCharge: result.charge,
      total: round2(subtotal + gstTotal + result.charge),
    };
  } catch (err) {
    if (err instanceof NoDeliveryRuleError) {
      console.error("[delivery] Misconfiguration — no pricing rule matches:", err.message);
    } else if (err instanceof DistanceUnavailableError) {
      console.error("[delivery] Distance provider unavailable");
    } else {
      console.error("[delivery] Quote failed:", err);
    }
    return fail("service_unavailable");
  }
}

/** Customer-facing copy. Never mentions distance or pricing logic. */
export function quoteFailureMessage(reason: QuoteFailureReason): string {
  switch (reason) {
    case "area_unavailable":
      return "✕ We currently don't deliver to this location.";
    case "pin_unresolved":
      return "We couldn't detect your location's PIN code. Please try again.";
    case "invalid_location":
      return "Please share a valid location.";
    case "empty_cart":
    case "invalid_items":
      return "Some items in your basket are no longer available. Please review your basket.";
    case "store_not_configured":
      return "Delivery is currently unavailable to this location.";
    default:
      return "Unable to check delivery right now. Please try again.";
  }
}
