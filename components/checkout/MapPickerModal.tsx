"use client";

import { useEffect, useRef, useState } from "react";
import { X, MapPin, Loader2, CheckCircle2, AlertTriangle, Search, Link as LinkIcon } from "lucide-react";
import { extractCoordinatesFromUrl } from "@/lib/location-parser";

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: { areaName: string; pincode: string }) => void;
  initialLink?: string;
}

export function MapPickerModal({ isOpen, onClose, onConfirm, initialLink = "" }: MapPickerModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const reverseGeocodeRef = useRef<((lat: number, lng: number) => Promise<void>) | null>(null);

  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [detectedArea, setDetectedArea] = useState<string>("");
  const [detectedPin, setDetectedPin] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Paste location link state
  const [linkInput, setLinkInput] = useState<string>(initialLink);
  const [linkLoading, setLinkLoading] = useState<boolean>(false);
  const [linkError, setLinkError] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setErrorMsg("");
    setLinkError("");
    setLinkInput(initialLink || "");

    // Load Leaflet CSS dynamically if not present
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const reverseGeocode = async (cLat: number, cLng: number) => {
      if (!isMounted) return;
      setGeocoding(true);
      setErrorMsg("");

      try {
        const res = await fetch(`/api/geocode/reverse?lat=${cLat}&lng=${cLng}`);
        const data = await res.json();

        if (data.success && data.pincode) {
          setDetectedPin(data.pincode);
          setDetectedArea(data.areaName || data.city || "Selected Area");
        } else {
          setErrorMsg(data.error || "Could not detect PIN code for this map location.");
          setDetectedPin("");
          setDetectedArea("");
        }
      } catch {
        setErrorMsg("Failed to resolve location details. Try selecting another point.");
      } finally {
        if (isMounted) setGeocoding(false);
      }
    };

    reverseGeocodeRef.current = reverseGeocode;

    // Function to initialize map
    const initMap = (lat = 9.9816, lng = 76.2999) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      // OpenStreetMap tile layer (Free, no API key)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom green marker icon
      const customIcon = L.divIcon({
        className: "custom-leaflet-pin",
        html: `<div style="background-color: #245B35; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size: 16px;">📍</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });

      const marker = L.marker([lat, lng], { icon: customIcon, draggable: true }).addTo(map);
      markerRef.current = marker;

      // Initial geocode
      reverseGeocode(lat, lng);

      // Drag end listener
      marker.on("dragend", () => {
        const position = marker.getLatLng();
        reverseGeocode(position.lat, position.lng);
      });

      // Map click listener
      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        marker.setLatLng(e.latlng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      if (isMounted) setLoading(false);
    };

    // Load Leaflet JS dynamically if not present
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(window as any).L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => initMap(pos.coords.latitude, pos.coords.longitude),
            () => initMap(9.9816, 76.2999),
            { timeout: 5000 }
          );
        } else {
          initMap(9.9816, 76.2999);
        }
      };
      document.body.appendChild(script);
    } else {
      initMap(9.9816, 76.2999);
    }

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, initialLink]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!detectedPin) return;
    onConfirm({ areaName: detectedArea, pincode: detectedPin });
    onClose();
  };

  const handleFindLocationFromLink = async () => {
    const url = linkInput.trim();
    if (!url) {
      setLinkError("Please enter a valid map location link.");
      return;
    }

    setLinkLoading(true);
    setLinkError("");

    try {
      const res = await extractCoordinatesFromUrl(url);
      if ("error" in res) {
        setLinkError(res.error);
      } else {
        const { lat, lng } = res;
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }
        if (reverseGeocodeRef.current) {
          await reverseGeocodeRef.current(lat, lng);
        }
        setLinkError("");
      }
    } catch {
      setLinkError("Unable to find a location from this link. Please check the link and try again.");
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gb-border flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-green-50 text-gb-green flex items-center justify-center font-bold">
              🗺
            </div>
            <div>
              <h3 className="font-bold text-gb-charcoal text-base">Select Delivery Location on Map</h3>
              <p className="text-xs text-gray-500">Tap or drag marker, or paste a location link below</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close map modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Paste Location Link Bar */}
        <div className="px-4 sm:px-6 py-3 bg-gray-50/90 border-b border-gray-200/80 space-y-1.5">
          <label className="text-xs font-bold text-gb-charcoal flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <LinkIcon size={13} className="text-gb-green" />
              <span>Paste Location Link</span>
            </span>
            <span className="text-[11px] text-gray-400 font-normal">Google Maps link</span>
          </label>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="url"
                value={linkInput}
                onChange={(e) => {
                  setLinkInput(e.target.value);
                  if (linkError) setLinkError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleFindLocationFromLink();
                  }
                }}
                placeholder="Paste Google Maps location link here (e.g. https://maps.app.goo.gl/...)"
                className="w-full text-xs py-2.5 pl-8 pr-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-gb-green text-gb-charcoal shadow-2xs"
              />
              <LinkIcon size={14} className="absolute left-2.5 top-3 text-gray-400" />
            </div>

            <button
              type="button"
              onClick={handleFindLocationFromLink}
              disabled={linkLoading || !linkInput.trim()}
              className="px-4 py-2.5 text-xs font-bold text-white bg-gb-green hover:bg-gb-green-dark rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {linkLoading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
              <span>{linkLoading ? "Finding…" : "Find Location"}</span>
            </button>
          </div>

          {linkError && (
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1 pt-0.5">
              <AlertTriangle size={13} className="shrink-0" />
              <span>{linkError}</span>
            </p>
          )}
        </div>

        {/* Map Body */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[360px] bg-gray-100">
          {loading && (
            <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-2xs flex flex-col items-center justify-center gap-2 text-xs font-semibold text-gray-600">
              <Loader2 size={24} className="animate-spin text-gb-green" />
              <span>Loading map interface…</span>
            </div>
          )}

          <div ref={mapContainerRef} className="w-full h-full min-h-[300px] sm:min-h-[360px] z-0" />

          {/* Hint Overlay */}
          <div className="absolute top-3 left-3 right-3 z-10 pointer-events-none flex justify-center">
            <span className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-gb-charcoal shadow-md border border-gray-200/80 flex items-center gap-1.5">
              <MapPin size={14} className="text-gb-green" /> Tap on map or drag pin to choose point
            </span>
          </div>
        </div>

        {/* Footer Preview & Action Bar */}
        <div className="p-4 sm:p-6 bg-white border-t border-gray-100 space-y-3">
          {geocoding ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 py-1">
              <Loader2 size={16} className="animate-spin text-gb-green" />
              <span>Detecting location details…</span>
            </div>
          ) : errorMsg ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-amber-600" />
              <span>{errorMsg}</span>
            </div>
          ) : detectedPin ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs text-emerald-800 font-medium">Selected Location Preview</p>
                  <p className="text-sm font-extrabold text-emerald-950">
                    {detectedArea} — <span className="font-mono">{detectedPin}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-400 py-1">Select a point on the map to see Area & PIN Code preview</div>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!detectedPin || geocoding}
              className="btn-primary py-2.5 px-5 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
