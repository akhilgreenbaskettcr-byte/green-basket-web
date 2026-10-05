/**
 * Server-side geo helpers: coordinate validation + PIN reverse geocoding.
 * Providers: OpenStreetMap Nominatim (primary) → BigDataCloud (fallback).
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ReverseGeocodeResult {
  pincode: string;
  areaName: string;
  rawAddress?: Record<string, unknown>;
}

export function isValidCoordinates(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

const normalizePin = (raw: unknown): string => {
  let pin = String(raw ?? "").replace(/\D/g, "");
  if (pin.length > 6) pin = pin.slice(0, 6);
  return pin;
};

const REQUEST_TIMEOUT_MS = 6000;

/** Returns null when no 6-digit PIN could be resolved. Throws on provider network failure for both providers. */
export async function reverseGeocodePin({ lat, lng }: Coordinates): Promise<ReverseGeocodeResult | null> {
  let networkFailures = 0;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "GreenBasketApp/1.0 (contact@greenbasket.in)",
          "Accept-Language": "en-US,en;q=0.9",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
    );
    if (res.ok) {
      const data = await res.json();
      const address = data?.address || {};
      const pincode = normalizePin(address.postcode);
      if (pincode.length === 6) {
        const areaName =
          address.suburb ||
          address.neighbourhood ||
          address.residential ||
          address.village ||
          address.town ||
          address.city_district ||
          address.county ||
          address.city ||
          "Detected Area";
        return { pincode, areaName, rawAddress: address };
      }
    }
  } catch (err) {
    networkFailures++;
    console.error("[geo] Nominatim reverse geocode failed:", err);
  }

  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { cache: "no-store", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }
    );
    if (res.ok) {
      const data = await res.json();
      const pincode = normalizePin(data?.postcode);
      if (pincode.length === 6) {
        const areaName = data?.locality || data?.city || data?.principalSubdivision || "Detected Area";
        return { pincode, areaName };
      }
    }
  } catch (err) {
    networkFailures++;
    console.error("[geo] BigDataCloud reverse geocode failed:", err);
  }

  if (networkFailures === 2) throw new Error("Reverse geocoding providers are unreachable");
  return null;
}
