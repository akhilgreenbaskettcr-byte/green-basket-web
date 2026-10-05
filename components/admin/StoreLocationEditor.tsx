"use client";

import { useState } from "react";
import { Crosshair, Link2, Loader2, MapPin } from "lucide-react";
import { extractCoordinatesFromUrl } from "@/lib/location-parser";

interface StoreLocationEditorProps {
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

/**
 * Store origin used for delivery-distance calculation.
 * Values (store_lat / store_lng / store_location_label / store_location_link) are persisted
 * with the surrounding settings form's "Save" action.
 */
export function StoreLocationEditor({ values, onChange }: StoreLocationEditorProps) {
  const [link, setLink] = useState(values["store_location_link"] ?? "");
  const [busy, setBusy] = useState<"link" | "gps" | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const lat = values["store_lat"];
  const lng = values["store_lng"];
  const hasLocation = !!lat && !!lng;

  const applyCoordinates = async (c: { lat: number; lng: number }, sourceLink: string) => {
    onChange("store_lat", c.lat.toFixed(6));
    onChange("store_lng", c.lng.toFixed(6));
    onChange("store_location_link", sourceLink);

    let label = "";
    try {
      const res = await fetch(`/api/geocode/reverse?lat=${c.lat}&lng=${c.lng}`);
      const data = await res.json();
      if (data?.success) label = `${data.areaName} – ${data.pincode}`;
    } catch {
      /* label is optional */
    }
    onChange("store_location_label", label);
    setMessage({ type: "ok", text: "Store location captured. Click “Save Changes” to apply." });
  };

  const handleLink = async () => {
    setMessage(null);
    setBusy("link");
    const result = await extractCoordinatesFromUrl(link);
    if ("error" in result) {
      setMessage({ type: "error", text: result.error });
    } else {
      await applyCoordinates(result, link.trim());
    }
    setBusy(null);
  };

  const handleGps = () => {
    setMessage(null);
    if (!navigator.geolocation) {
      setMessage({ type: "error", text: "Geolocation is not supported by this browser." });
      return;
    }
    setBusy("gps");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const mapLink = `https://www.google.com/maps?q=${c.lat},${c.lng}`;
        setLink(mapLink);
        await applyCoordinates(c, mapLink);
        setBusy(null);
      },
      () => {
        setMessage({ type: "error", text: "Unable to read your location. Check browser permissions." });
        setBusy(null);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return (
    <div className="sm:col-span-2 pt-4 border-t border-gray-100 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-gb-charcoal">Store Location</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Delivery distance is measured from this point. Paste a Google Maps link or use your current location.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Paste Google Maps link"
          className="gb-input flex-1"
          id="store-location-link"
        />
        <button
          type="button"
          onClick={handleLink}
          disabled={busy !== null || !link.trim()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-gb-green text-gb-green hover:bg-gb-green hover:text-white transition-colors disabled:opacity-50"
        >
          {busy === "link" ? <Loader2 size={15} className="animate-spin" /> : <Link2 size={15} />}
          Use Link
        </button>
        <button
          type="button"
          onClick={handleGps}
          disabled={busy !== null}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gb-green text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {busy === "gps" ? <Loader2 size={15} className="animate-spin" /> : <Crosshair size={15} />}
          Use Current Location
        </button>
      </div>

      {message && (
        <p className={message.type === "ok" ? "text-xs text-emerald-700" : "text-xs text-red-600"}>
          {message.text}
        </p>
      )}

      <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 flex items-start gap-3">
        <MapPin size={18} className={hasLocation ? "text-gb-green mt-0.5" : "text-gray-300 mt-0.5"} />
        {hasLocation ? (
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs flex-1">
            <div className="sm:col-span-3">
              <dt className="text-gray-400">Saved location</dt>
              <dd className="font-semibold text-gb-charcoal">{values["store_location_label"] || "Custom location"}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Latitude</dt>
              <dd className="font-mono text-gb-charcoal">{lat}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Longitude</dt>
              <dd className="font-mono text-gb-charcoal">{lng}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-xs text-amber-700">
            No store location set. Customers cannot check out until a store location is saved.
          </p>
        )}
      </div>
    </div>
  );
}
