"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { createOrder } from "@/app/actions/order";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { AuthModal } from "@/components/auth/AuthModal";
import { extractCoordinatesFromUrl } from "@/lib/location-parser";
import { loadRazorpayScript } from "@/lib/razorpay";
import { trackBeginCheckout } from "@/lib/analytics";
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
  CreditCard,
  Banknote,
  ShieldCheck,
  Lock,
  ShoppingBag,
} from "lucide-react";
import type { SavedAddress } from "@/types/database";

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
  enableCod?: boolean;
}

type LocationFetchStatus = "IDLE" | "FETCHING" | "FILLED" | "DENIED" | "ERROR";

type DeliveryQuoteState =
  | { status: "IDLE" }
  | { status: "CHECKING" }
  | {
      status: "AVAILABLE";
      pincode: string;
      areaName: string;
      subtotal: number;
      gstTotal: number;
      deliveryCharge: number;
      total: number;
    }
  | { status: "UNAVAILABLE"; message: string }
  | { status: "ERROR"; message: string };

export function CheckoutForm({ enableCod = true }: CheckoutFormProps) {
  const router = useRouter();
  const { items, subtotal, gstTotal, gstBreakdown, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<"IDLE" | "OPENING" | "CONFIRMING" | "COD">("IDLE");
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const isOrderSuccessRef = useRef(false);

  // Auth & Saved Addresses state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "custom">("custom");
  const [showAuthModal, setShowAuthModal] = useState(false);
  // Location & server-verified delivery quote state
  const [locationFetch, setLocationFetch] = useState<LocationFetchStatus>("IDLE");
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLink, setLocationLink] = useState<string>("");
  const [pastedLinkInput, setPastedLinkInput] = useState<string>("");
  const [pastedLinkError, setPastedLinkError] = useState<string>("");
  const [pastedLinkLoading, setPastedLinkLoading] = useState<boolean>(false);
  const [quote, setQuote] = useState<DeliveryQuoteState>({ status: "IDLE" });
  const quoteRequestId = useRef(0);

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
        setLocationLink(url);
        setGpsCoords({ lat: res.lat, lng: res.lng });
        setLocationFetch("IDLE");
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
    city: "Thrissur",
    pincode: "",
    notes: "",
  });

  // Pre-load Razorpay script on mount
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  // Fetch logged in user & their saved addresses
  useEffect(() => {
    setMounted(true);

    if (items && items.length > 0) {
      trackBeginCheckout(items, subtotal());
    }

    const supabase = createClient();

    async function loadUserData() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (currentUser) {
        setUser(currentUser);

        // Pre-fill name and email from profile if available
        setForm((prev) => ({
          ...prev,
          customer_name:
            prev.customer_name ||
            currentUser.user_metadata?.full_name ||
            "",
          email: prev.email || currentUser.email || "",
          phone: prev.phone || currentUser.user_metadata?.phone || "",
        }));

        // Fetch saved addresses
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: addresses } = await (supabase as any)
          .from("saved_addresses")
          .select("*")
          .order("is_default", { ascending: false });

        if (addresses && addresses.length > 0) {
          setSavedAddresses(addresses);
          const defaultAddr = addresses.find((a: SavedAddress) => a.is_default) || addresses[0];
          setSelectedAddressId(defaultAddr.id);
          applySavedAddress(defaultAddr);
        }
      }
    }

    loadUserData();
  }, [items, subtotal]);

  const applySavedAddress = (addr: SavedAddress) => {
    setForm((prev) => ({
      ...prev,
      customer_name: (addr as any).full_name || (addr as any).recipient_name || prev.customer_name,
      phone: addr.phone || prev.phone,
      address: addr.address_line,
      city: addr.city || "Thrissur",
      pincode: addr.pincode,
    }));
  };

  const handleSelectSavedAddress = (addrId: string) => {
    setSelectedAddressId(addrId);
    if (addrId === "custom") {
      setForm((prev) => ({
        ...prev,
        address: "",
        pincode: "",
      }));
    } else {
      const selected = savedAddresses.find((a) => a.id === addrId);
      if (selected) {
        applySavedAddress(selected);
      }
    }
  };

  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationFetch("ERROR");
      setPastedLinkError("Location is not supported by your browser. Please paste a Google Maps link instead.");
      return;
    }

    setLocationFetch("FETCHING");
    setPastedLinkError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsCoords({ lat: latitude, lng: longitude });
        setLocationLink(`https://www.google.com/maps?q=${latitude},${longitude}`);
        setPastedLinkInput("");
        setLocationFetch("FILLED");
      },
      (error) => {
        const denied = error.code === error.PERMISSION_DENIED;
        setLocationFetch(denied ? "DENIED" : "ERROR");
        setPastedLinkError(
          denied
            ? "Location permission was denied. Please paste a Google Maps link instead."
            : "Could not retrieve your location. Please paste a Google Maps link instead."
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Server-side eligibility + delivery charge. Re-runs whenever the location or cart changes.
  const cartSignature = items.map((i) => `${i.variantId}:${i.quantity}`).join("|");
  useEffect(() => {
    if (!gpsCoords || items.length === 0) return;

    const requestId = ++quoteRequestId.current;
    setQuote({ status: "CHECKING" });

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/delivery/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: gpsCoords.lat,
            lng: gpsCoords.lng,
            items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          }),
        });
        const data = await res.json();
        if (requestId !== quoteRequestId.current) return;

        if (!res.ok || !data.success) {
          setQuote({ status: "ERROR", message: data?.error || "Unable to check delivery right now. Please try again." });
          return;
        }

        if (data.available) {
          setQuote({
            status: "AVAILABLE",
            pincode: data.pincode,
            areaName: data.areaName,
            subtotal: data.subtotal,
            gstTotal: data.gstTotal,
            deliveryCharge: data.deliveryCharge,
            total: data.total,
          });
          setForm((prev) => ({
            ...prev,
            pincode: data.pincode,
            city: data.areaName ? `${data.areaName}, Thrissur` : prev.city,
          }));
          setErrors((prev) => ({ ...prev, location: "" }));
        } else if (data.reason === "area_unavailable") {
          setQuote({ status: "UNAVAILABLE", message: data.message });
        } else {
          setQuote({ status: "ERROR", message: data.message });
        }
      } catch {
        if (requestId === quoteRequestId.current) {
          setQuote({ status: "ERROR", message: "Unable to check delivery right now. Please try again." });
        }
      }
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpsCoords, cartSignature]);

  const canOrder = quote.status === "AVAILABLE" && gpsCoords !== null;

  const sub = subtotal();
  const tax = gstTotal();
  const breakdown = gstBreakdown();
  const delivery = quote.status === "AVAILABLE" ? quote.deliveryCharge : 0;
  const total = quote.status === "AVAILABLE" ? quote.total : sub + tax;
  // Server-verified figures (the server recalculates everything again before charging).
  const orderTotals =
    quote.status === "AVAILABLE"
      ? {
          subtotal: quote.subtotal,
          gstTotal: quote.gstTotal,
          deliveryFee: quote.deliveryCharge,
          total: quote.total,
        }
      : { subtotal: sub, gstTotal: tax, deliveryFee: 0, total: sub + tax };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.customer_name.trim())
      newErrors.customer_name = "Name is required";
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (form.address.trim().length < 10)
      newErrors.address = "Please enter a complete address";
    if (!canOrder)
      newErrors.location = "Please check your delivery location to continue.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);

    try {
      // 1. CASH ON DELIVERY FLOW
      if (paymentMethod === "cod") {
        setLoadingStatus("COD");
        const result = await createOrder({
          ...form,
          payment_method: "cod",
          gps_lat: gpsCoords?.lat as number,
          gps_lng: gpsCoords?.lng as number,
          location_link:
            locationLink ||
            pastedLinkInput.trim() ||
            (gpsCoords ? `https://www.google.com/maps?q=${gpsCoords.lat},${gpsCoords.lng}` : null),
          items: items.map((item) => {
            const lineTotal = item.price * item.quantity;
            const gstRate = item.gstPercentage ? Number(item.gstPercentage) : 0;
            const gstAmt =
              item.gstEnabled && gstRate > 0
                ? Math.round(((lineTotal * gstRate) / 100 + Number.EPSILON) * 100) / 100
                : 0;
            return {
              productId: item.productId,
              variantId: item.variantId,
              productName: item.productName,
              variantLabel: item.variantLabel,
              price: item.price,
              quantity: item.quantity,
              imageUrl: item.imageUrl,
              gstPercentage: gstRate,
              gstAmount: gstAmt,
            };
          }),
          ...orderTotals,
        });

        if (result.success) {
          isOrderSuccessRef.current = true;
          clearCart();
          window.location.href = `/order-success?order=${result.orderNumber}`;
          return;
        } else {
          setServerError(result.error);
          setLoading(false);
          setLoadingStatus("IDLE");
        }
        return;
      }

      // 2. RAZORPAY PAYMENT FLOW
      setLoadingStatus("OPENING");
      const isScriptReady = await loadRazorpayScript();
      if (!isScriptReady) {
        setServerError("Unable to load Razorpay payment gateway. Please check your internet connection or choose Cash on Delivery.");
        setLoading(false);
        setLoadingStatus("IDLE");
        return;
      }

      // Create Razorpay order on server with complete backup metadata
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receipt: `rcpt_${Date.now()}`,
          customer_name: form.customer_name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          notes: form.notes,
          gps_lat: gpsCoords?.lat,
          gps_lng: gpsCoords?.lng,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            productName: i.productName,
            variantLabel: i.variantLabel,
            price: i.price,
            quantity: i.quantity,
            imageUrl: i.imageUrl,
          })),
        }),
      });

      const rzpOrderData = await orderRes.json();

      if (!orderRes.ok || !rzpOrderData.success) {
        setServerError(rzpOrderData.error || "Failed to initialize Razorpay checkout. Please try again.");
        setLoading(false);
        setLoadingStatus("IDLE");
        return;
      }

      // Launch Razorpay popup
      const options = {
        key: rzpOrderData.keyId,
        amount: rzpOrderData.amount,
        currency: rzpOrderData.currency || "INR",
        name: "Green Basket TCR",
        description: "Fresh Kerala Kitchen Groceries",
        image: "https://www.greenbaskettcr.com/images/logo/Green-basket-logo.png",
        order_id: rzpOrderData.orderId,
        prefill: {
          name: form.customer_name,
          contact: form.phone,
          email: form.email || undefined,
        },
        theme: {
          color: "#245B35",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setLoadingStatus("IDLE");
            setServerError("Payment was cancelled. You can retry or choose Cash on Delivery.");
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (response: any) => {
          setLoading(true);
          setLoadingStatus("CONFIRMING");
          try {
            const result = await createOrder({
              ...form,
              payment_method: "razorpay",
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              gps_lat: gpsCoords?.lat as number,
              gps_lng: gpsCoords?.lng as number,
              location_link:
                locationLink ||
                pastedLinkInput.trim() ||
                (gpsCoords ? `https://www.google.com/maps?q=${gpsCoords.lat},${gpsCoords.lng}` : null),
              items: items.map((item) => {
                const lineTotal = item.price * item.quantity;
                const gstRate = item.gstPercentage ? Number(item.gstPercentage) : 0;
                const gstAmt =
                  item.gstEnabled && gstRate > 0
                    ? Math.round(((lineTotal * gstRate) / 100 + Number.EPSILON) * 100) / 100
                    : 0;
                return {
                  productId: item.productId,
                  variantId: item.variantId,
                  productName: item.productName,
                  variantLabel: item.variantLabel,
                  price: item.price,
                  quantity: item.quantity,
                  imageUrl: item.imageUrl,
                  gstPercentage: gstRate,
                  gstAmount: gstAmt,
                };
              }),
              ...orderTotals,
            });

            if (result.success) {
              isOrderSuccessRef.current = true;
              clearCart();
              router.replace(`/order-success?order=${result.orderNumber}`);
              return;
            } else {
              setServerError(result.error);
              setLoading(false);
              setLoadingStatus("IDLE");
            }
          } catch {
            setServerError("Payment received but order registration failed. Please contact support immediately.");
            setLoading(false);
            setLoadingStatus("IDLE");
          }
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rzp.on("payment.failed", (res: any) => {
        setLoading(false);
        setLoadingStatus("IDLE");
        setServerError(res.error?.description || "Payment failed. Please try again.");
      });
      rzp.open();
    } catch {
      setServerError("Something went wrong placing your order. Please try again.");
      setLoading(false);
      setLoadingStatus("IDLE");
    }
  };

  useEffect(() => {
    if (mounted && items.length === 0 && !isOrderSuccessRef.current && !loading) {
      router.push("/cart");
    }
  }, [mounted, items.length, router, loading]);

  if (isOrderSuccessRef.current || loadingStatus === "CONFIRMING") {
    return (
      <div className="bg-white rounded-3xl border border-gray-200/90 p-8 sm:p-12 max-w-lg mx-auto text-center space-y-5 shadow-lg shadow-emerald-950/5">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto text-gb-green shadow-xs">
          <CheckCircle2 size={42} className="animate-pulse" />
        </div>
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-100/80 text-gb-green text-xs font-bold uppercase tracking-wider mb-2">
            Payment Verified
          </span>
          <h2 className="text-2xl font-black text-gb-charcoal">Order Confirmed!</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Finalizing your order reference and generating your receipt…
          </p>
        </div>
        <div className="w-7 h-7 border-3 border-gb-green border-t-transparent rounded-full animate-spin mx-auto mt-4" />
      </div>
    );
  }

  if (!mounted || items.length === 0) return null;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* ─── Left Column ─── */}
        <div className="lg:col-span-2 space-y-6 mb-8 lg:mb-0">

          {/* ── Section 1: Delivery Location ── */}
          <div className="bg-white rounded-2xl border border-gb-border p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-gb-border pb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-gb-green flex items-center justify-center shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <h2 className="font-bold text-gb-charcoal text-base">
                  Delivery Location
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  We need your location to check delivery availability.
                </p>
              </div>
            </div>

            {/* Option 1: Current location */}
            <button
              type="button"
              id="use-current-location-btn"
              onClick={handleGetLiveLocation}
              disabled={locationFetch === "FETCHING"}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-gb-green text-gb-green font-bold text-sm hover:bg-gb-green hover:text-white transition-colors disabled:opacity-60"
            >
              {locationFetch === "FETCHING" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <span aria-hidden="true">📍</span>
              )}
              <span>{locationFetch === "FETCHING" ? "Getting your location…" : "Use My Current Location"}</span>
            </button>

            <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-400">
              <span className="flex-1 h-px bg-gray-200" />
              OR
              <span className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Option 2: Paste Google Maps link */}
            <div className="p-3.5 bg-gray-50/90 rounded-xl border border-gray-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <LinkIcon size={14} className="text-gb-green" />
                  Paste your Google Maps location link
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={pastedLinkInput}
                  onChange={(e) => {
                    setPastedLinkInput(e.target.value);
                    if (pastedLinkError) setPastedLinkError("");
                  }}
                  placeholder="https://maps.app.goo.gl/..."
                  className="gb-input text-xs py-2 bg-white flex-1"
                  aria-label="Google Maps location link"
                />
                <button
                  type="button"
                  id="check-location-btn"
                  onClick={handleFindLocationFromCheckoutLink}
                  disabled={pastedLinkLoading || !pastedLinkInput.trim()}
                  className="px-3.5 py-2 rounded-xl bg-gb-green text-white text-xs font-bold hover:bg-gb-green-dark transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  {pastedLinkLoading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Search size={13} />
                  )}
                  <span>Check Location</span>
                </button>
              </div>
              {pastedLinkError && (
                <p className="text-[11px] text-red-600 font-medium">{pastedLinkError}</p>
              )}
            </div>

            {/* Delivery availability status (no distance / pricing details are ever shown) */}
            {quote.status === "CHECKING" && (
              <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-600 flex items-center gap-2" role="status">
                <Loader2 size={16} className="animate-spin text-gb-green shrink-0" />
                Checking delivery availability…
              </div>
            )}
            {quote.status === "AVAILABLE" && (
              <div className="p-3.5 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 flex items-start gap-2.5 text-xs" role="status">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="font-bold text-emerald-900">✓ Delivery available to your location</p>
              </div>
            )}
            {quote.status === "UNAVAILABLE" && (
              <div className="p-3.5 rounded-xl border bg-red-50 border-red-200 text-red-800 flex items-start gap-2.5 text-xs" role="status">
                <XCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                <p className="font-bold text-red-900">{quote.message}</p>
              </div>
            )}
            {quote.status === "ERROR" && (
              <div className="p-3.5 rounded-xl border bg-amber-50 border-amber-200 text-amber-800 flex items-start gap-2.5 text-xs" role="alert">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="font-semibold">{quote.message}</p>
              </div>
            )}
            {errors.location && quote.status !== "AVAILABLE" && (
              <p className="text-red-500 text-xs">{errors.location}</p>
            )}
          </div>

          {/* ── Section 2: Contact & Address Details ── */}
          <div className="bg-white rounded-2xl border border-gb-border p-6 shadow-sm space-y-5">
            <h2 className="font-bold text-gb-charcoal text-base border-b border-gb-border pb-4">
              Contact & Address Details
            </h2>

            <div className="space-y-4">
              {/* Full Name & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="customer_name" className="gb-label">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className={`gb-input ${errors.customer_name ? "border-red-400 bg-red-50/50" : ""}`}
                    aria-invalid={Boolean(errors.customer_name)}
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
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    autoComplete="tel"
                    className={`gb-input ${errors.phone ? "border-red-400 bg-red-50/50" : ""}`}
                    aria-invalid={Boolean(errors.phone)}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="email" className="gb-label">
                  Email Address <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="For digital invoices and updates"
                  autoComplete="email"
                  className={`gb-input ${errors.email ? "border-red-400 bg-red-50/50" : ""}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Delivery Address */}
              <div>
                <label htmlFor="address" className="gb-label">
                  Delivery Address <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="House/flat number, building name, street, landmark"
                  rows={3}
                  className={`gb-input resize-none ${errors.address ? "border-red-400 bg-red-50/50" : ""}`}
                  aria-invalid={Boolean(errors.address)}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>

              {/* Special Delivery Instructions */}
              <div>
                <label htmlFor="notes" className="gb-label">
                  Special Delivery Instructions <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Gate code, drop at front door, call upon arrival, etc."
                  className="gb-input"
                />
              </div>
            </div>
          </div>

          {/* ── Section 3: Payment Method Selection ── */}
          <div className="bg-white rounded-2xl border border-gb-border p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gb-border pb-3">
              <h2 className="font-bold text-gb-charcoal text-base flex items-center gap-2">
                <CreditCard size={18} className="text-gb-green" />
                <span>Select Payment Method</span>
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Lock size={11} /> 256-Bit SSL Encrypted
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Option 1: Razorpay Online Payment */}
              <label
                className={`flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "razorpay"
                    ? "border-gb-green bg-emerald-50/40 shadow-xs"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="payment_method"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                      className="accent-gb-green w-4 h-4 cursor-pointer"
                    />
                    <span className="font-bold text-sm text-gb-charcoal">
                      Pay Online (Razorpay)
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-xs text-gray-500 pl-6 leading-relaxed">
                  UPI (GPay, PhonePe, Paytm), Credit/Debit Cards & Net Banking.
                </p>
              </label>

              {/* Option 2: Cash on Delivery (only if enabled in store settings) */}
              {enableCod && (
                <label
                  className={`flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-gb-green bg-emerald-50/40 shadow-xs"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="payment_method"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="accent-gb-green w-4 h-4 cursor-pointer"
                      />
                      <span className="font-bold text-sm text-gb-charcoal">
                        Cash on Delivery (COD)
                      </span>
                    </div>
                    <Banknote size={16} className="text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 pl-6 leading-relaxed">
                    Pay with cash when your fresh grocery order arrives at your door.
                  </p>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* ─── Right Column — Summary & CTA ─── */}
        <div>
          <div className="bg-white rounded-2xl border border-gb-border p-6 sticky top-24 shadow-sm space-y-4">
            <h2 className="font-bold text-gb-charcoal text-base pb-2 border-b border-gb-border">
              Order Summary
            </h2>

            {/* Cart Items with Product Image Thumbnails */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.variantId} className="flex items-center gap-3 pt-3 first:pt-0 text-sm">
                  {/* Product Thumbnail */}
                  <div className="relative w-12 h-12 rounded-xl bg-[#FAFAF5] border border-gray-200/80 shrink-0 overflow-hidden flex items-center justify-center p-1 shadow-2xs">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        sizes="48px"
                        className="object-contain p-0.5 mix-blend-multiply select-none"
                      />
                    ) : (
                      <ShoppingBag size={18} className="text-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gb-charcoal text-xs sm:text-sm truncate">
                      {item.productName}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {item.variantLabel} × <span className="font-semibold text-gray-700">{item.quantity}</span>
                    </p>
                  </div>
                  <span className="font-bold text-gb-charcoal text-xs sm:text-sm shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-gb-border pt-4 space-y-2.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gb-charcoal">{formatPrice(sub)}</span>
              </div>

              {/* GST Breakdown (Grouped by Tax Rate) */}
              {tax > 0 && (
                <div className="space-y-1.5 py-1">
                  {breakdown.map((b) => (
                    <div key={b.percentage} className="flex justify-between text-xs text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <span className="font-medium text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[10px]">
                          GST @{b.percentage}%
                        </span>
                        <span className="text-[11px] text-gray-400">on {formatPrice(b.taxableAmount)}</span>
                      </span>
                      <span className="font-medium text-gb-charcoal">+{formatPrice(b.gstAmount)}</span>
                    </div>
                  ))}
                  {breakdown.length > 1 && (
                    <div className="flex justify-between text-xs font-semibold text-gray-700 pt-1 border-t border-dashed border-gray-100">
                      <span>Total GST Taxes</span>
                      <span className="text-amber-800">+{formatPrice(tax)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className="font-medium text-gb-charcoal">
                  {quote.status === "AVAILABLE" ? (
                    delivery === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      formatPrice(delivery)
                    )
                  ) : quote.status === "CHECKING" ? (
                    <Loader2 size={14} className="animate-spin text-gray-400" />
                  ) : (
                    <span className="text-gray-400 text-xs font-normal">Add location</span>
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


            {/* Delivery Inspection & Verification Policy Notice */}
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 space-y-1 text-left">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
                <span>Delivery Inspection Policy</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                <strong>On-the-Spot Inspection:</strong> Please inspect your items in the presence of the delivery executive. Claims for missing or damaged items cannot be accepted once the executive leaves your premises.
              </p>
            </div>

            {/* Place Order / Razorpay Payment Button */}
            <button
              type="submit"
              disabled={!canOrder || loading}
              className={`btn-primary w-full justify-center py-3.5 text-sm font-bold transition-all shadow-md flex items-center gap-2 ${
                !canOrder || loading
                  ? "opacity-50 cursor-not-allowed saturate-0"
                  : "hover:shadow-lg"
              }`}
              id="place-order-btn"
              aria-disabled={!canOrder || loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  <span>
                    {loadingStatus === "OPENING"
                      ? "Opening Razorpay Gateway…"
                      : "Placing Your Order…"}
                  </span>
                </>
              ) : paymentMethod === "razorpay" ? (
                <>
                  <Lock size={15} />
                  <span>PAY {formatPrice(total)} ONLINE (UPI / CARDS)</span>
                </>
              ) : (
                <>
                  <Banknote size={16} />
                  <span>PLACE ORDER (CASH ON DELIVERY)</span>
                </>
              )}
            </button>

            {quote.status === "IDLE" && (
              <p className="text-[11px] text-center text-gray-500">
                Share your delivery location to continue.
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
          const supabase = createClient();
          supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u));
        }}
      />
    </form>
  );
}
