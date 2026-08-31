"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { createOrder } from "@/app/actions/order";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { AuthModal } from "@/components/auth/AuthModal";
import { MapPickerModal } from "@/components/checkout/MapPickerModal";
import { extractCoordinatesFromUrl } from "@/lib/location-parser";
import {
  Loader2,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Navigation,
  RefreshCw,
  UserCheck,
  Plus,
  Search,
  Link as LinkIcon,
} from "lucide-react";
import type { DeliveryArea, SavedAddress } from "@/types/database";

const DELIVERY_FEE = 40;
const FREE_DELIVERY_ABOVE = 500;

interface FormData {
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

interface CheckoutFormProps {
  deliveryAreas?: DeliveryArea[];
}

type LocationFetchStatus = "IDLE" | "FETCHING" | "FILLED" | "DENIED" | "ERROR";

export function CheckoutForm({ deliveryAreas = [] }: CheckoutFormProps) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  // Auth & Saved Addresses state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "custom">("custom");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  // GPS autofill state — does NOT control order eligibility
  const [locationFetch, setLocationFetch] = useState<LocationFetchStatus>("IDLE");
  const [locationNote, setLocationNote] = useState("");

  // Paste Location Link state
  const [initialLinkForMap, setInitialLinkForMap] = useState<string>("");
  const [pastedLinkInput, setPastedLinkInput] = useState<string>("");
  const [pastedLinkError, setPastedLinkError] = useState<string>("");
  const [pastedLinkLoading, setPastedLinkLoading] = useState<boolean>(false);

  const handleFindLocationFromCheckoutLink = async () => {
    const url = pastedLinkInput.trim();
    if (!url) {
      setPastedLinkError("Please enter a valid map location link.");
      return;
    }

    setPastedLinkLoading(true);
    setPastedLinkError("");

    try {
      const res = await extractCoordinatesFromUrl(url);
      if ("error" in res) {
        setPastedLinkError(res.error);
      } else {
        setInitialLinkForMap(url);
        setShowMapModal(true);
        setPastedLinkError("");
      }
    } catch {
      setPastedLinkError("Unable to find a location from this link. Please check the link and try again.");
    } finally {
      setPastedLinkLoading(false);
    }
  };

  const [form, setForm] = useState<FormData>({
    customer_name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    notes: "",
  });

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();

    const fetchUserData = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        setForm((prev) => ({
          ...prev,
          email: prev.email || currentUser.email || "",
          customer_name: prev.customer_name || currentUser.user_metadata?.full_name || "",
        }));

        // Fetch saved addresses
        const { data: addrs } = await supabase
          .from("addresses")
          .select("*")
          .order("is_default", { ascending: false });

        if (addrs && addrs.length > 0) {
          const typedAddrs = addrs as SavedAddress[];
          setSavedAddresses(typedAddrs);
          // Auto-select default or first saved address
          const defaultAddr = typedAddrs.find((a) => a.is_default) || typedAddrs[0];
          handleSelectSavedAddress(defaultAddr);
        }
      }
    };

    fetchUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserData();
      } else {
        setSavedAddresses([]);
        setSelectedAddressId("custom");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setForm((prev) => ({
      ...prev,
      customer_name: addr.full_name,
      phone: addr.phone,
      address: addr.address_line,
      city: addr.city,
      pincode: addr.pincode,
    }));
    setErrors({});
  };

  const handleMapConfirm = (loc: { areaName: string; pincode: string }) => {
    setForm((prev) => ({
      ...prev,
      city: loc.areaName,
      pincode: loc.pincode,
    }));
    setLocationFetch("FILLED");
    setLocationNote("Area and PIN code auto-filled from map selection.");
    setErrors((prev) => ({ ...prev, city: "", pincode: "" }));
  };

  const sub = subtotal();
  const delivery = sub >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const total = sub + delivery;

  // The sole eligibility check: PIN code must exist in active admin delivery areas
  const isPinApproved =
    form.pincode.trim().length === 6 &&
    deliveryAreas.some((da) => da.pincode === form.pincode.trim() && da.is_active);

  const approvedArea = deliveryAreas.find(
    (da) => da.pincode === form.pincode.trim() && da.is_active
  );

  // Clear location inputs so user can choose manually or from dropdown
  const handleClearLocation = () => {
    setForm((prev) => ({
      ...prev,
      pincode: "",
      city: "",
    }));
    setLocationFetch("IDLE");
    setLocationNote("");
    setErrors((prev) => ({ ...prev, pincode: "", city: "" }));
  };

  // Generic field change handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // For pincode: only allow digits
    const sanitized = name === "pincode" ? value.replace(/\D/g, "").slice(0, 6) : value;
    setForm((prev) => ({ ...prev, [name]: sanitized }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Delivery area dropdown selection — auto-fills both area + PIN
  const handleDeliveryAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPin = e.target.value;
    const matched = deliveryAreas.find((da) => da.pincode === selectedPin);
    setForm((prev) => ({
      ...prev,
      pincode: selectedPin,
      city: matched ? matched.area_name : prev.city,
    }));
    setLocationFetch("IDLE");
    setLocationNote("");
    setErrors((prev) => ({ ...prev, pincode: "", city: "" }));
  };

  // GPS autofill — optional convenience only, does NOT block checkout
  const handleAutofillLocation = () => {
    if (!navigator.geolocation) {
      setLocationFetch("ERROR");
      setLocationNote("Your browser does not support geolocation.");
      return;
    }

    setLocationFetch("FETCHING");
    setLocationNote("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude: lat, longitude: lng } = position.coords;
          const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
          const data = await res.json();

          if (data.success && data.pincode) {
            setForm((prev) => ({
              ...prev,
              pincode: data.pincode,
              city: data.areaName || prev.city,
            }));
            setErrors((prev) => ({ ...prev, pincode: "", city: "" }));
            setLocationFetch("FILLED");
            setLocationNote(`Area and PIN code auto-filled from your current location.`);
          } else {
            setLocationFetch("ERROR");
            setLocationNote(
              data.error ||
                "Unable to detect your PIN code. Please enter your area and PIN code manually."
            );
          }
        } catch {
          setLocationFetch("ERROR");
          setLocationNote(
            "Unable to detect your location. Please enter your area and PIN code manually."
          );
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationFetch("DENIED");
          setLocationNote(
            "Location access was denied. You can still enter your area and PIN code manually."
          );
        } else {
          setLocationFetch("ERROR");
          setLocationNote(
            "Could not retrieve your location. Please enter your area and PIN code manually."
          );
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (form.customer_name.trim().length < 2)
      newErrors.customer_name = "Name must be at least 2 characters";
    if (!/^[6-9]\d{9}$/.test(form.phone.trim()))
      newErrors.phone = "Enter a valid 10-digit Indian mobile number";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      newErrors.email = "Enter a valid email";
    if (form.address.trim().length < 10)
      newErrors.address = "Please enter a complete address";
    if (!isPinApproved)
      newErrors.pincode = `Delivery is currently unavailable for PIN code ${form.pincode || "(empty)"}. Please select an active delivery area.`;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const result = await createOrder({
        ...form,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantLabel: item.variantLabel,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal: sub,
        deliveryFee: delivery,
        total,
      });

      if (result.success) {
        clearCart();
        router.push(`/order-success?order=${result.orderNumber}`);
      } else {
        setServerError(result.error);
      }
    } catch {
      setServerError("Something went wrong placing your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Redirect to cart if empty after mounting — performed inside useEffect to avoid render side-effects
  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push("/cart");
    }
  }, [mounted, items.length, router]);

  if (!mounted || items.length === 0) return null;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* ─── Left Column ─── */}
        <div className="lg:col-span-2 space-y-6 mb-8 lg:mb-0">

          {/* ── Section 1: Delivery Location ── */}
          <div className="bg-white rounded-2xl border border-gb-border p-6 shadow-sm space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gb-border pb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-gb-green flex items-center justify-center shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <h2 className="font-bold text-gb-charcoal text-base">
                  Delivery Location
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select your delivery area below or enter your location details.
                </p>
              </div>
            </div>

            {/* 1. FIRST: Delivery Area Dropdown */}
            <div className="space-y-1">
              <label htmlFor="delivery_area_select" className="gb-label flex items-center justify-between">
                <span>Select Delivery Area <span className="text-red-400">*</span></span>
                <span className="text-[11px] text-gray-400 font-normal">
                  {deliveryAreas.length} area{deliveryAreas.length !== 1 ? "s" : ""} available
                </span>
              </label>

              {deliveryAreas.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  No active delivery areas are currently configured. Please contact store support.
                </div>
              ) : (
                <select
                  id="delivery_area_select"
                  value={deliveryAreas.some((da) => da.pincode === form.pincode) ? form.pincode : ""}
                  onChange={handleDeliveryAreaChange}
                  className="gb-input cursor-pointer font-medium text-gb-charcoal"
                  aria-label="Select a delivery area"
                >
                  <option value="" disabled>
                    — Select an approved delivery area —
                  </option>
                  {deliveryAreas.map((area) => (
                    <option key={area.id} value={area.pincode}>
                      {area.area_name} — {area.pincode}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-[11px] text-gray-400 pt-0.5">
                Selecting an area automatically fills Area and PIN Code below.
              </p>
            </div>

            {/* 2. SECOND: Area / Locality & PIN Code Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Area / Locality */}
              <div>
                <label htmlFor="city" className="gb-label">
                  Area / Locality <span className="text-red-400">*</span>
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Kakkanad"
                  className={`gb-input ${errors.city ? "!border-red-400" : ""}`}
                  autoComplete="address-level2"
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                )}
              </div>

              {/* PIN Code */}
              <div>
                <label htmlFor="pincode" className="gb-label">
                  PIN Code <span className="text-red-400">*</span>
                </label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="682030"
                  className={`gb-input font-mono tracking-wider ${errors.pincode ? "!border-red-400" : ""}`}
                  autoComplete="postal-code"
                />
                {errors.pincode && (
                  <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
                )}
              </div>
            </div>

            {/* 3. THIRD: Location Assistance Options */}
            <div className="space-y-3 pt-1">
              <label className="gb-label text-xs">Choose Location Assistance</label>
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleAutofillLocation}
                  disabled={locationFetch === "FETCHING"}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-gb-green bg-green-50 hover:bg-green-100 active:bg-green-200 border border-green-200 px-4 py-2.5 rounded-xl transition-colors shrink-0 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  id="use-my-location-btn"
                >
                  {locationFetch === "FETCHING" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Navigation size={14} />
                  )}
                  {locationFetch === "FETCHING"
                    ? "Detecting location…"
                    : "📍 Use My Current Location"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInitialLinkForMap("");
                    setShowMapModal(true);
                  }}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-gb-charcoal bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-300 px-4 py-2.5 rounded-xl transition-colors shrink-0 shadow-2xs cursor-pointer"
                  id="select-location-map-btn"
                >
                  <span>🗺 Select Location on Map</span>
                </button>
              </div>

              {/* Paste Location Link Option */}
              <div className="bg-gray-50/90 border border-gray-200/90 rounded-2xl p-3.5 space-y-2">
                <label htmlFor="checkout_location_link_input" className="text-xs font-bold text-gb-charcoal flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <LinkIcon size={14} className="text-gb-green" />
                    <span>Have a location link? Paste it here</span>
                  </span>
                  <span className="text-[11px] text-gray-400 font-normal">Google Maps link</span>
                </label>

                <div className="flex items-center gap-2">
                  <input
                    id="checkout_location_link_input"
                    type="url"
                    value={pastedLinkInput}
                    onChange={(e) => {
                      setPastedLinkInput(e.target.value);
                      if (pastedLinkError) setPastedLinkError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleFindLocationFromCheckoutLink();
                      }
                    }}
                    placeholder="Paste Google Maps location link (e.g. https://maps.app.goo.gl/...)"
                    className="flex-1 text-xs py-2 px-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-gb-green text-gb-charcoal shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={handleFindLocationFromCheckoutLink}
                    disabled={pastedLinkLoading || !pastedLinkInput.trim()}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-gb-green hover:bg-gb-green-dark rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {pastedLinkLoading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                    <span>{pastedLinkLoading ? "Finding…" : "Find Location"}</span>
                  </button>
                </div>

                {pastedLinkError && (
                  <p className="text-xs text-rose-600 font-medium flex items-center gap-1 pt-0.5">
                    <AlertTriangle size={13} className="shrink-0" />
                    <span>{pastedLinkError}</span>
                  </p>
                )}
              </div>
            </div>

            {/* GPS feedback note with Clear action */}
            {locationNote && (
              <div
                className={`text-xs px-3 py-2.5 rounded-xl border flex items-center justify-between gap-2 flex-wrap ${
                  locationFetch === "FILLED"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-amber-50 border-amber-100 text-amber-800"
                }`}
                role="status"
              >
                <div className="flex items-center gap-2">
                  {locationFetch === "FILLED" ? (
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                  )}
                  <span>{locationNote}</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="text-[11px] font-bold underline hover:no-underline text-gray-600 hover:text-gray-900 shrink-0"
                >
                  ✕ Clear Location
                </button>
              </div>
            )}

            {/* 4. FOURTH: Delivery Availability Status Banner */}
            {form.pincode.trim().length === 6 && (
              <div
                className={`rounded-xl px-4 py-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  isPinApproved
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
                role="status"
                aria-live="polite"
              >
                <div className="flex items-start sm:items-center gap-2.5">
                  {isPinApproved ? (
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5 sm:mt-0" />
                  ) : (
                    <XCircle size={18} className="text-red-500 shrink-0 mt-0.5 sm:mt-0" />
                  )}
                  <div>
                    <p className="text-sm font-bold">
                      {isPinApproved
                        ? `✓ Delivery available to ${approvedArea?.area_name ?? (form.city || "this area")}`
                        : `✕ We currently don't deliver to PIN code ${form.pincode}`}
                    </p>
                    {isPinApproved ? (
                      <p className="text-xs font-medium opacity-80">
                        PIN Code: <span className="font-mono">{form.pincode}</span>
                      </p>
                    ) : (
                      <p className="text-xs opacity-80">
                        Please select an active delivery area from the dropdown above or enter an eligible PIN code.
                      </p>
                    )}
                  </div>
                </div>

                {!isPinApproved && (
                  <button
                    type="button"
                    onClick={handleClearLocation}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-white text-red-700 hover:bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl shadow-xs transition-colors shrink-0"
                  >
                    ✕ Clear &amp; Select Manually
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── Section 2: Contact & Address ── */}
          <div className="bg-white rounded-2xl border border-gb-border p-6 shadow-sm">
            <h2 className="font-semibold text-gb-charcoal text-base mb-5">
              Contact &amp; Address Details
            </h2>

            {/* Saved Addresses for Logged-In User */}
            {user && savedAddresses.length > 0 && (
              <div className="mb-6 space-y-3 border-b border-gray-100 pb-5">
                <div className="flex items-center justify-between">
                  <label className="gb-label mb-0">Saved Addresses</label>
                  <span className="text-xs text-gray-400 font-normal">
                    {savedAddresses.length} address{savedAddresses.length !== 1 ? "es" : ""} saved
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`p-3.5 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? "border-gb-green bg-green-50/50 shadow-2xs ring-1 ring-gb-green/20"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-extrabold text-gb-green uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-green-200">
                            {addr.label}
                          </span>
                          {isSelected && <CheckCircle2 size={15} className="text-gb-green shrink-0" />}
                        </div>
                        <p className="text-xs font-bold text-gb-charcoal">{addr.full_name}</p>
                        <p className="text-[11px] text-gray-500 font-mono mt-0.5">{addr.phone}</p>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">{addr.address_line}</p>
                        <p className="text-xs font-semibold text-gb-charcoal mt-1">
                          {addr.city} — <span className="font-mono">{addr.pincode}</span>
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="customer_name" className="gb-label">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="customer_name"
                    name="customer_name"
                    type="text"
                    value={form.customer_name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className={`gb-input ${errors.customer_name ? "!border-red-400" : ""}`}
                    autoComplete="name"
                    required
                  />
                  {errors.customer_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="gb-label">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className={`gb-input ${errors.phone ? "!border-red-400" : ""}`}
                    autoComplete="tel"
                    required
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="gb-label">
                  Email Address{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={`gb-input ${errors.email ? "!border-red-400" : ""}`}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Full Delivery Address */}
              <div>
                <label htmlFor="address" className="gb-label">
                  Delivery Address <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="House/flat no., street name, building, landmark…"
                  rows={3}
                  className={`gb-input resize-none ${errors.address ? "!border-red-400" : ""}`}
                  autoComplete="street-address"
                  required
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>

              {/* Delivery Notes */}
              <div>
                <label htmlFor="notes" className="gb-label">
                  Special Delivery Instructions{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Gate code, drop at front door, call upon arrival, etc."
                  rows={2}
                  className="gb-input resize-none"
                />
              </div>
            </div>
          </div>

          {/* Cash on Delivery Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-800 text-sm font-medium mb-1">
              💰 Cash on Delivery
            </p>
            <p className="text-amber-700 text-xs leading-relaxed">
              We currently accept Cash on Delivery. Pay when your fresh basket arrives at your door.
            </p>
          </div>
        </div>

        {/* ─── Right Column — Summary & CTA ─── */}
        <div>
          <div className="bg-white rounded-2xl border border-gb-border p-6 sticky top-24 shadow-sm space-y-4">
            <h2 className="font-bold text-gb-charcoal text-base pb-2 border-b border-gb-border">
              Order Summary
            </h2>

            {/* Cart Items */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.variantId} className="flex justify-between gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gb-charcoal truncate">
                      {item.productName}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {item.variantLabel} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium text-gb-charcoal shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-gb-border pt-4 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gb-charcoal">{formatPrice(sub)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className="font-medium text-gb-charcoal">
                  {delivery === 0 ? (
                    <span className="text-green-600 font-semibold">Free</span>
                  ) : (
                    formatPrice(delivery)
                  )}
                </span>
              </div>
            </div>

            <div className="border-t border-gb-border pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gb-charcoal">Total</span>
                <span className="font-bold text-gb-charcoal text-xl">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Server error */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5" role="alert">
                <p className="text-red-600 text-xs font-medium leading-relaxed flex items-start gap-1.5">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-500" />
                  <span>{serverError}</span>
                </p>
              </div>
            )}

            {/* Delivery unavailable inline warning above button */}
            {form.pincode.trim().length === 6 && !isPinApproved && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 text-xs text-red-700 font-medium">
                ✕ Delivery is currently unavailable for PIN code{" "}
                <span className="font-mono font-bold">{form.pincode}</span>. Select an eligible area to continue.
              </div>
            )}

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={!isPinApproved || loading}
              className={`btn-primary w-full justify-center py-3.5 text-sm font-bold transition-all shadow-md ${
                !isPinApproved || loading
                  ? "opacity-50 cursor-not-allowed saturate-0"
                  : "hover:shadow-lg"
              }`}
              id="place-order-btn"
              aria-disabled={!isPinApproved || loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  Placing Order…
                </>
              ) : (
                "Place Order"
              )}
            </button>

            {!isPinApproved && form.pincode.trim().length < 6 && (
              <p className="text-[11px] text-center text-gray-500">
                Select or enter a delivery area and PIN code to continue.
              </p>
            )}

            <Link
              href="/cart"
              className="block text-center text-xs text-gray-500 hover:text-gb-green transition-colors mt-1"
            >
              ← Edit Cart Items
            </Link>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          // Re-fetch user data on modal success
          const supabase = createClient();
          supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u));
        }}
      />

      <MapPickerModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        onConfirm={handleMapConfirm}
        initialLink={initialLinkForMap}
      />
    </form>
  );
}
