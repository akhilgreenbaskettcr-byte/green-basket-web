import { describe, expect, it } from "vitest";
import {
  calculateDeliveryCharge,
  findRuleForSubtotal,
  NoDeliveryRuleError,
  parseFreeDeliveryConfig,
  type DeliveryRule,
} from "./pricing";

const rules: DeliveryRule[] = [
  { id: "a", min_order: 0, max_order: 199.99, free_distance_km: 0, base_charge: 30, per_km_charge: 0 },
  { id: "b", min_order: 200, max_order: 499.99, free_distance_km: 3, base_charge: 40, per_km_charge: 6 },
  { id: "c", min_order: 500, max_order: 1499.99, free_distance_km: 5, base_charge: 40, per_km_charge: 6 },
];
const free = { enabled: true, minOrder: 1500 };
const calc = (subtotal: number, distanceKm: number, freeDelivery = free, r = rules) =>
  calculateDeliveryCharge({ subtotal, distanceKm, rules: r, freeDelivery });

describe("calculateDeliveryCharge", () => {
  it("charges ₹30 below ₹200", () => {
    expect(calc(199, 2).charge).toBe(30);
  });
  it("is free for ≥₹200 within 3 km", () => {
    expect(calc(200, 3).charge).toBe(0);
  });
  it("is free for ≥₹500 within 5 km", () => {
    expect(calc(500, 5).charge).toBe(0);
  });
  it("charges base + per-km beyond free distance (8 km with 5 km free threshold → ₹40 + 3*6 = ₹58)", () => {
    expect(calc(500, 8).charge).toBe(58);
  });
  it("charges base + per-km for ₹300 order at 4 km (3 km free threshold → ₹40 + 1*6 = ₹46)", () => {
    expect(calc(300, 4).charge).toBe(46);
  });
  it("is free at ₹1500 regardless of distance", () => {
    expect(calc(1500, 25).charge).toBe(0);
  });
  it("applies normal rules when free delivery is disabled", () => {
    expect(calc(2000, 8, { enabled: false, minOrder: 1500 }, [...rules, { ...rules[2], id: "d", min_order: 1500, max_order: null }]).charge).toBe(58);
  });
  it("throws when no rule matches", () => {
    expect(() => calc(2000, 8, { enabled: false, minOrder: 1500 })).toThrow(NoDeliveryRuleError);
  });
  it("rounds to the nearest rupee", () => {
    expect(calc(500, 5.5).charge).toBe(43);
  });
});

describe("findRuleForSubtotal", () => {
  it("picks the band containing the subtotal", () => {
    expect(findRuleForSubtotal(199.99, rules)?.id).toBe("a");
    expect(findRuleForSubtotal(200, rules)?.id).toBe("b");
  });
  it("handles sub-paisa gaps", () => {
    expect(findRuleForSubtotal(199.995, rules)?.id).toBe("a");
  });
});

describe("parseFreeDeliveryConfig", () => {
  it("defaults to enabled / ₹1500", () => {
    expect(parseFreeDeliveryConfig({})).toEqual({ enabled: true, minOrder: 1500 });
  });
  it("reads settings", () => {
    expect(parseFreeDeliveryConfig({ free_delivery_enabled: "false", free_delivery_min_order: "2000" })).toEqual({
      enabled: false,
      minOrder: 2000,
    });
  });
});
