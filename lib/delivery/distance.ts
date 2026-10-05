/**
 * Driving-distance provider (server only).
 *   1. Google Routes API  (when GOOGLE_MAPS_API_KEY is set)
 *   2. OSRM public router (fallback)
 * Straight-line (Haversine) distance is intentionally NOT used for pricing.
 */
import type { Coordinates } from "./geo";

const TIMEOUT_MS = 5000;
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX = 500;

const cache = new Map<string, { km: number; expires: number }>();

export class DistanceUnavailableError extends Error {
  constructor(message = "Unable to compute driving distance") {
    super(message);
    this.name = "DistanceUnavailableError";
  }
}

const key = (a: Coordinates, b: Coordinates) =>
  [a.lat, a.lng, b.lat, b.lng].map((n) => n.toFixed(4)).join("|");

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch {
    return fn();
  }
}

async function googleDistanceKm(from: Coordinates, to: Coordinates, apiKey: string): Promise<number> {
  const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "routes.distanceMeters",
    },
    body: JSON.stringify({
      origin: { location: { latLng: { latitude: from.lat, longitude: from.lng } } },
      destination: { location: { latLng: { latitude: to.lat, longitude: to.lng } } },
      travelMode: "DRIVE",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Google Routes HTTP ${res.status}`);
  const data = await res.json();
  const meters = data?.routes?.[0]?.distanceMeters;
  if (typeof meters !== "number") throw new Error("Google Routes returned no route");
  return meters / 1000;
}

async function osrmDistanceKm(from: Coordinates, to: Coordinates): Promise<number> {
  const base = process.env.OSRM_BASE_URL || "https://router.project-osrm.org";
  const url = `${base}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;
  const res = await fetch(url, {
    headers: { "User-Agent": "GreenBasketApp/1.0 (contact@greenbasket.in)" },
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
  const data = await res.json();
  const meters = data?.routes?.[0]?.distance;
  if (data?.code !== "Ok" || typeof meters !== "number") throw new Error("OSRM returned no route");
  return meters / 1000;
}

/** Driving distance in km (rounded to 2 decimals). @throws DistanceUnavailableError */
export async function getDrivingDistanceKm(from: Coordinates, to: Coordinates): Promise<number> {
  const k = key(from, to);
  const hit = cache.get(k);
  if (hit && hit.expires > Date.now()) return hit.km;

  const googleKey = process.env.GOOGLE_MAPS_API_KEY;
  let km: number | null = null;

  if (googleKey) {
    try {
      km = await withRetry(() => googleDistanceKm(from, to, googleKey));
    } catch (err) {
      console.error("[distance] Google Routes failed, falling back to OSRM:", err);
    }
  }

  if (km === null) {
    try {
      km = await withRetry(() => osrmDistanceKm(from, to));
    } catch (err) {
      console.error("[distance] OSRM failed:", err);
      throw new DistanceUnavailableError();
    }
  }

  const rounded = Math.round(km * 100) / 100;
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(k, { km: rounded, expires: Date.now() + CACHE_TTL_MS });
  return rounded;
}
