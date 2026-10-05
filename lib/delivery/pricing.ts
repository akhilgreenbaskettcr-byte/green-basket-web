/**
 * Delivery pricing engine — pure functions, no I/O (safe on client & server, unit-testable).
 *
 * Rules live in the `delivery_pricing_rules` table. A rule applies to a band of
 * order values (subtotal BEFORE GST):
 *   - min_order / max_order : band (max_order null = no upper limit, bounds inclusive)
 *   - free_distance_km      : within this driving distance delivery is FREE
 *   - base_charge           : charged once the customer is beyond the free distance
 *   - per_km_charge         : extra charge per km ...
 *   - extra_after_km        : ... for every km beyond this distance
 *
 * Charge when distance > free_distance_km:
 *     base_charge + per_km_charge × max(0, distance − extra_after_km)
 * (NEVER per_km_charge × the whole distance.)
 */

export interface DeliveryRule {
  id: string;
  min_order: number;
  max_order: number | null;
  free_distance_km: number;
  base_charge: number;
  per_km_charge: number;
  extra_after_km?: number;
}

export interface FreeDeliveryConfig {
  enabled: boolean;
  minOrder: number;
}

export type DeliveryChargeReason = "free_high_value" | "free_distance" | "rule";

export interface DeliveryChargeResult {
  charge: number;
  rule: DeliveryRule | null;
  reason: DeliveryChargeReason;
}

export class NoDeliveryRuleError extends Error {
  constructor(subtotal: number) {
    super(`No delivery pricing rule matches an order value of ${subtotal}`);
    this.name = "NoDeliveryRuleError";
  }
}

export const DEFAULT_FREE_DELIVERY_MIN_ORDER = 1500;

export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

const toNumber = (v: unknown, fallback: number): number => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : fallback;
};

/** Build the free-delivery config from `site_settings` scalar keys. */
export function parseFreeDeliveryConfig(
  settings: Record<string, string | null | undefined>
): FreeDeliveryConfig {
  const enabled = settings["free_delivery_enabled"];
  const min = settings["free_delivery_min_order"];
  return {
    enabled: enabled === undefined || enabled === null || enabled === "" ? true : enabled !== "false",
    minOrder: Math.max(0, toNumber(min, DEFAULT_FREE_DELIVERY_MIN_ORDER)),
  };
}

/** Pick the rule whose (inclusive) order-value band contains the subtotal. */
export function findRuleForSubtotal(subtotal: number, rules: DeliveryRule[]): DeliveryRule | null {
  const sorted = [...rules].sort((a, b) => a.min_order - b.min_order);
  const eligible = sorted.filter((r) => subtotal >= r.min_order);
  if (eligible.length === 0) return null;

  const containing = eligible.filter((r) => r.max_order === null || subtotal <= r.max_order);
  if (containing.length > 0) return containing[containing.length - 1];

  // Sub-paisa gap between adjacent bands (e.g. 199.994 between 199.99 and 200): closest lower band.
  const closest = eligible[eligible.length - 1];
  const nextBand = sorted.find((r) => r.min_order > closest.min_order);
  return nextBand && subtotal < nextBand.min_order && closest.max_order !== null
    ? closest
    : null;
}

export interface CalculateChargeInput {
  subtotal: number;
  distanceKm: number;
  rules: DeliveryRule[];
  freeDelivery: FreeDeliveryConfig;
}

/** @throws NoDeliveryRuleError when no rule matches and the order does not qualify for free delivery. */
export function calculateDeliveryCharge({
  subtotal,
  distanceKm,
  rules,
  freeDelivery,
}: CalculateChargeInput): DeliveryChargeResult {
  if (freeDelivery.enabled && freeDelivery.minOrder > 0 && subtotal >= freeDelivery.minOrder) {
    return { charge: 0, rule: null, reason: "free_high_value" };
  }

  const rule = findRuleForSubtotal(subtotal, rules);
  if (!rule) throw new NoDeliveryRuleError(subtotal);

  if (rule.free_distance_km > 0 && distanceKm <= rule.free_distance_km) {
    return { charge: 0, rule, reason: "free_distance" };
  }

  const startsAfterKm = rule.free_distance_km;
  const additionalKm = Math.max(0, distanceKm - startsAfterKm);
  const charge = rule.base_charge + rule.per_km_charge * additionalKm;
  return { charge: Math.round(charge), rule, reason: "rule" };
}
