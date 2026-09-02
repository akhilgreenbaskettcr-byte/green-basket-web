"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { formatPrice, formatOrderStatus } from "@/lib/utils";
import {
  Package,
  Clock,
  Loader2,
  Search,
  MapPin,
  Plus,
  Trash2,
  LogOut,
  User as UserIcon,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import type { Order, SavedAddress } from "@/types/database";

interface TrackedOrderItem {
  id: string;
  product_id?: string | null;
  product_name_snapshot: string;
  variant_label_snapshot: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products?: any;
}

type TrackedOrder = Pick<
  Order,
  "id" | "order_number" | "status" | "total" | "created_at" | "customer_name" | "city" | "delivery_fee" | "pincode" | "address" | "notes"
> & {
  order_items?: TrackedOrderItem[];
};

export function AccountClient() {
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [productImageMap, setProductImageMap] = useState<Record<string, string>>({});

  // Dashboard active tab: "orders" | "addresses" | "track"
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "track">("orders");

  // User Orders State
  const [myOrders, setMyOrders] = useState<TrackedOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // User Saved Addresses State
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    full_name: "",
    phone: "",
    address_line: "",
    city: "",
    pincode: "",
    label: "Home",
    is_default: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");

  // Guest Order Tracker state
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [searched, setSearched] = useState(false);
  const [trackedOrders, setTrackedOrders] = useState<TrackedOrder[]>([]);
  const [trackError, setTrackError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    const loadUser = async () => {
      setLoadingUser(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      setLoadingUser(false);

      // Load all product images for 100% reliable thumbnail fallback
      const { data: prods } = await supabase
        .from("products")
        .select("id, name, image_url");

      if (prods) {
        const pMap: Record<string, string> = {};
        prods.forEach((p: { id: string; name: string; image_url: string | null }) => {
          if (p.image_url) {
            pMap[p.id] = p.image_url;
            pMap[p.name.trim().toLowerCase()] = p.image_url;
          }
        });
        setProductImageMap(pMap);
      }

      if (currentUser) {
        // Load User Orders
        setLoadingOrders(true);
        const { data: ordersData } = await supabase
          .from("orders")
          .select(`
            id, order_number, status, total, created_at, customer_name, city, delivery_fee, pincode, address, notes,
            order_items (
              id, product_id, product_name_snapshot, variant_label_snapshot, unit_price, quantity, line_total,
              products (image_url)
            )
          `)
          .order("created_at", { ascending: false });
        setMyOrders((ordersData as unknown as TrackedOrder[]) || []);
        setLoadingOrders(false);

        // Load Saved Addresses
        setLoadingAddresses(true);
        const { data: addrData } = await supabase
          .from("addresses")
          .select("*")
          .order("is_default", { ascending: false });
        setAddresses((addrData as SavedAddress[]) || []);
        setLoadingAddresses(false);
      } else {
        setActiveTab("track");
      }
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === "SIGNED_OUT" || !session?.user) {
        setActiveTab("track");
        setMyOrders([]);
        setAddresses([]);
      } else if (event === "SIGNED_IN") {
        loadUser();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError("");

    if (addressForm.pincode.length !== 6) {
      setAddressError("Please enter a valid 6-digit PIN code.");
      return;
    }

    setSavingAddress(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        full_name: addressForm.full_name.trim(),
        phone: addressForm.phone.trim(),
        address_line: addressForm.address_line.trim(),
        city: addressForm.city.trim(),
        pincode: addressForm.pincode.trim(),
        label: addressForm.label,
        is_default: addressForm.is_default,
      })
      .select("*")
      .single();

    if (error || !data) {
      setAddressError(error?.message || "Failed to save address.");
      setSavingAddress(false);
      return;
    }

    setAddresses((prev) => [data as SavedAddress, ...prev]);
    setSavingAddress(false);
    setShowAddAddressModal(false);
    setAddressForm({
      full_name: "",
      phone: "",
      address_line: "",
      city: "",
      pincode: "",
      label: "Home",
      is_default: false,
    });
  };

  const handleDeleteAddress = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (!error) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setTrackError("");
    setSearched(true);

    startTransition(async () => {
      const supabase = createClient();
      const trimmed = query.trim();

      // Search by order_number or phone
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: dbError } = await (supabase as any)
        .from("orders")
        .select(`
          id, order_number, status, total, created_at, customer_name, city, delivery_fee, pincode, address, notes,
          order_items (
            id, product_name_snapshot, variant_label_snapshot, unit_price, quantity, line_total,
            products (image_url)
          )
        `)
        .or(`order_number.ilike.%${trimmed}%,phone.eq.${trimmed}`)
        .order("created_at", { ascending: false });

      if (dbError) {
        setTrackError("Could not find any order with that details. Please verify your order number or phone.");
        setTrackedOrders([]);
      } else {
        setTrackedOrders((data as TrackedOrder[]) || []);
      }
    });
  };

  const resolveItemImage = (item: any): string | null => {
    // 1. Direct joined product object
    if (item.products) {
      if (Array.isArray(item.products) && item.products[0]?.image_url) {
        return item.products[0].image_url;
      }
      if (typeof item.products === "object" && item.products.image_url) {
        return item.products.image_url;
      }
    }
    // 2. Direct product_id lookup in pre-fetched map
    if (item.product_id && productImageMap[item.product_id]) {
      return productImageMap[item.product_id];
    }
    // 3. Fallback lookup by product name snapshot (e.g. "Mix Fruits Cut")
    if (item.product_name_snapshot) {
      const cleanKey = item.product_name_snapshot.trim().toLowerCase();
      if (productImageMap[cleanKey]) {
        return productImageMap[cleanKey];
      }
    }
    return null;
  };

  if (loadingUser) {
    return (
      <div className="bg-white rounded-3xl border border-gb-border p-12 text-center text-sm text-gray-500">
        <Loader2 size={24} className="animate-spin mx-auto text-gb-green mb-2" />
        Loading your account details…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Logged In Header Banner */}
      {user ? (
        <div className="bg-white rounded-3xl border border-gb-border p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-gb-green flex items-center justify-center font-bold text-lg border border-green-100 shrink-0">
              <UserIcon size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gb-green uppercase tracking-wider">
                Customer Account
              </p>
              <h2 className="text-xl font-bold text-gb-charcoal">
                Hello, {user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer"}
              </h2>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{user.email || user.phone || "Registered User"}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 px-4 py-2.5 rounded-xl transition-all self-start sm:self-center"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      ) : (
        /* Guest Banner with Sign In Promo */
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl border border-emerald-100 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-gb-green bg-white px-3 py-1 rounded-full border border-green-200 mb-2">
              🌿 Green Basket Account
            </span>
            <h2 className="text-xl font-bold text-gb-charcoal">
              Welcome to Green Basket
            </h2>
            <p className="text-xs text-gray-600 mt-1 max-w-md">
              Sign in to save your delivery addresses and view your order history across all devices.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/login" className="btn-primary py-2.5 px-5 text-xs font-bold">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-xs font-bold text-gb-green bg-white hover:bg-green-50 border border-green-200 px-4 py-2.5 rounded-xl transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto no-scrollbar">
        {user && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === "orders"
                  ? "bg-gb-green text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <ShoppingBag size={14} />
              My Orders ({myOrders.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("addresses")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === "addresses"
                  ? "bg-gb-green text-white shadow-xs"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <MapPin size={14} />
              Saved Addresses ({addresses.length})
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setActiveTab("track")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === "track"
              ? "bg-gb-green text-white shadow-xs"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <Search size={14} />
          Track Order
        </button>
      </div>

      {/* TAB 1: MY ORDERS (Logged In) */}
      {user && activeTab === "orders" && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="bg-white rounded-3xl border border-gb-border p-12 text-center text-xs text-gray-500">
              <Loader2 size={24} className="animate-spin mx-auto text-gb-green mb-2" />
              Fetching your order history…
            </div>
          ) : myOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gb-border p-10 text-center space-y-3">
              <ShoppingBag size={36} className="mx-auto text-gray-300" />
              <h3 className="font-bold text-gb-charcoal text-base">No Orders Placed Yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                You haven&apos;t placed any orders with this account yet. Browse our farm fresh products and enjoy fast delivery!
              </p>
              <Link href="/categories" className="btn-primary inline-flex py-2.5 px-5 text-xs font-bold mt-2">
                Start Shopping
              </Link>
            </div>
          ) : (
            myOrders.map((order) => {
              const { label, color } = formatOrderStatus(order.status);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-gb-border p-6 shadow-2xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                    <div>
                      <span className="text-[11px] text-gray-400 font-mono">Order Number</span>
                      <p className="text-base font-bold text-gb-charcoal">{order.order_number}</p>
                    </div>
                    <span className={`gb-badge ${color} text-xs font-semibold px-3 py-1`}>
                      {label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <p className="text-gray-400">Date</p>
                      <p className="font-bold text-gb-charcoal mt-0.5">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Recipient</p>
                      <p className="font-bold text-gb-charcoal mt-0.5">{order.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Delivery Area</p>
                      <p className="font-bold text-gb-charcoal mt-0.5 font-mono">
                        {order.city} ({order.pincode})
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Total Amount</p>
                      <p className="font-extrabold text-gb-green text-sm mt-0.5">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>

                  {/* Ordered Items with Product Image Thumbnails */}
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Ordered Items ({order.order_items.reduce((s, i) => s + (i.quantity || 1), 0)})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {order.order_items.map((item) => {
                          const itemImg = resolveItemImage(item);
                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 bg-[#FAF8F2] p-2 rounded-2xl border border-[#EAE3D2]/70"
                            >
                              <div className="relative w-11 h-11 rounded-xl bg-white border border-gray-200/80 shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                                {itemImg ? (
                                  <Image
                                    src={itemImg}
                                    alt={item.product_name_snapshot}
                                    fill
                                    sizes="44px"
                                    className="object-contain mix-blend-multiply"
                                  />
                                ) : (
                                  <ShoppingBag size={18} className="text-gray-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0 text-xs">
                                <p className="font-bold text-gb-charcoal truncate">
                                  {item.product_name_snapshot}
                                </p>
                                <p className="text-gray-500 text-[11px] mt-0.5">
                                  {item.variant_label_snapshot} ×{" "}
                                  <span className="font-bold text-gb-charcoal">
                                    {item.quantity}
                                  </span>
                                </p>
                              </div>
                              <span className="font-extrabold text-gb-charcoal text-xs shrink-0 pr-1">
                                {formatPrice(item.line_total)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                    <span className="truncate max-w-xs">{order.address}</span>
                    <span
                      className={`font-medium px-2.5 py-0.5 rounded border text-[11px] ${
                        order.notes?.includes("PAID ONLINE") || order.notes?.includes("Razorpay")
                          ? "text-blue-700 bg-blue-50 border-blue-100"
                          : "text-emerald-700 bg-emerald-50 border-emerald-100"
                      }`}
                    >
                      {order.notes?.includes("PAID ONLINE") || order.notes?.includes("Razorpay")
                        ? "💳 Paid Online (Razorpay)"
                        : "💵 Cash on Delivery"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: SAVED ADDRESSES (Logged In) */}
      {user && activeTab === "addresses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gb-charcoal text-base">Your Saved Delivery Addresses</h3>
            <button
              type="button"
              onClick={() => setShowAddAddressModal(true)}
              className="btn-primary py-2 px-3.5 text-xs font-bold gap-1.5"
            >
              <Plus size={15} /> Add New Address
            </button>
          </div>

          {loadingAddresses ? (
            <div className="bg-white rounded-3xl border border-gb-border p-8 text-center text-xs text-gray-500">
              <Loader2 size={20} className="animate-spin mx-auto text-gb-green mb-2" />
              Loading saved addresses…
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gb-border p-10 text-center space-y-3">
              <MapPin size={36} className="mx-auto text-gray-300" />
              <h4 className="font-bold text-gb-charcoal text-base">No Saved Addresses</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Save your delivery address for 1-click checkout experience on Green Basket.
              </p>
              <button
                type="button"
                onClick={() => setShowAddAddressModal(true)}
                className="btn-primary inline-flex py-2.5 px-5 text-xs font-bold mt-2"
              >
                + Add Address Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="bg-white rounded-3xl border border-gb-border p-5 shadow-2xs space-y-3 relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-extrabold text-gb-green uppercase tracking-wider bg-green-50 px-2.5 py-0.5 rounded border border-green-100">
                        {addr.label}
                      </span>
                      {addr.is_default && (
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gb-charcoal">{addr.full_name}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{addr.phone}</p>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">{addr.address_line}</p>
                    <p className="text-xs font-bold text-gb-charcoal mt-1">
                      {addr.city} — <span className="font-mono">{addr.pincode}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TRACK ORDER (Available for Guests & Logged In) */}
      {activeTab === "track" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gb-border p-6 md:p-8 space-y-4 shadow-2xs">
            <h2 className="text-xl font-bold text-gb-charcoal flex items-center gap-2">
              <Package size={20} className="text-gb-green" />
              Track Any Order
            </h2>
            <p className="text-xs text-gray-500">
              Enter your Order Number (e.g. <code className="bg-gray-100 px-1.5 py-0.5 rounded">GB-20260822-0001</code>) or your 10-digit mobile number.
            </p>

            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Order number or phone number"
                  className="gb-input !pl-11 pr-4 py-3"
                  style={{ paddingLeft: "2.75rem" }}
                  required
                />
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <button type="submit" disabled={isPending} className="btn-primary shrink-0 justify-center py-3">
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Searching…
                  </>
                ) : (
                  "Track Order"
                )}
              </button>
            </form>

            {trackError && (
              <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-red-500" />
                <span>{trackError}</span>
              </div>
            )}
          </div>

          {/* Results */}
          {searched && !isPending && (
            <div className="space-y-4">
              {trackedOrders.length === 0 && !trackError ? (
                <div className="bg-white rounded-3xl border border-gb-border p-8 text-center">
                  <Clock size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="font-bold text-gb-charcoal text-sm">No orders found</p>
                  <p className="text-gray-400 text-xs mt-1">
                    We couldn&apos;t find any order matching &ldquo;{query}&rdquo;.
                  </p>
                </div>
              ) : (
                trackedOrders.map((order) => {
                  const { label, color } = formatOrderStatus(order.status);
                  return (
                    <div key={order.id} className="bg-white rounded-3xl border border-gb-border p-6 space-y-4 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
                        <div>
                          <span className="text-xs text-gray-400 font-mono">Order Number</span>
                          <p className="text-base font-bold text-gb-charcoal">{order.order_number}</p>
                        </div>
                        <span className={`gb-badge ${color} text-xs font-semibold px-3 py-1`}>
                          {label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                          <p className="text-gray-400">Customer</p>
                          <p className="font-medium text-gray-700 mt-0.5">{order.customer_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Delivery Area</p>
                          <p className="font-medium text-gray-700 mt-0.5 font-mono">{order.city} ({order.pincode})</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Date</p>
                          <p className="font-medium text-gray-700 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Ordered Items with Product Image Thumbnails */}
                      {order.order_items && order.order_items.length > 0 && (
                        <div className="pt-3 border-t border-gray-100 space-y-2">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Ordered Items ({order.order_items.reduce((s, i) => s + (i.quantity || 1), 0)})
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {order.order_items.map((item) => {
                              const itemImg = resolveItemImage(item);
                              return (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3 bg-[#FAF8F2] p-2 rounded-2xl border border-[#EAE3D2]/70"
                                >
                                  <div className="relative w-11 h-11 rounded-xl bg-white border border-gray-200/80 shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                                    {itemImg ? (
                                      <Image
                                        src={itemImg}
                                        alt={item.product_name_snapshot}
                                        fill
                                        sizes="44px"
                                        className="object-contain mix-blend-multiply"
                                      />
                                    ) : (
                                      <ShoppingBag size={18} className="text-gray-300" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0 text-xs">
                                    <p className="font-bold text-gb-charcoal truncate">
                                      {item.product_name_snapshot}
                                    </p>
                                    <p className="text-gray-500 text-[11px] mt-0.5">
                                      {item.variant_label_snapshot} ×{" "}
                                      <span className="font-bold text-gb-charcoal">
                                        {item.quantity}
                                      </span>
                                    </p>
                                  </div>
                                  <span className="font-extrabold text-gb-charcoal text-xs shrink-0 pr-1">
                                    {formatPrice(item.line_total)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Total Amount</span>
                        <span className="text-base font-bold text-gb-charcoal">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gb-border space-y-4">
            <button
              type="button"
              onClick={() => setShowAddAddressModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gb-charcoal">Add Saved Address</h3>

            <form onSubmit={handleAddAddress} className="space-y-3">
              <div>
                <label className="gb-label text-xs">Label (e.g. Home, Work)</label>
                <input
                  type="text"
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                  placeholder="Home"
                  className="gb-input text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="gb-label text-xs">Full Name</label>
                  <input
                    type="text"
                    value={addressForm.full_name}
                    onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                    placeholder="Full Name"
                    className="gb-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="gb-label text-xs">Phone Number</label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    placeholder="10-digit phone"
                    className="gb-input text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="gb-label text-xs">Delivery Address</label>
                <textarea
                  value={addressForm.address_line}
                  onChange={(e) => setAddressForm({ ...addressForm, address_line: e.target.value })}
                  placeholder="Flat/House no, street name, landmark"
                  rows={2}
                  className="gb-input text-xs resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="gb-label text-xs">Area / Locality</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="e.g. Kakkanad"
                    className="gb-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="gb-label text-xs">PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, "") })}
                    placeholder="682030"
                    className="gb-input text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {addressError && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-200">
                  {addressError}
                </div>
              )}

              <button
                type="submit"
                disabled={savingAddress}
                className="btn-primary w-full justify-center py-2.5 text-xs font-bold mt-2"
              >
                {savingAddress ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Saving Address…
                  </>
                ) : (
                  "Save Address"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
