"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  Calculator,
  ShoppingBag,
  CheckCircle2,
  Phone,
  User,
  MapPin,
  FileText,
  CreditCard,
  Printer,
  MessageCircle,
  Sparkles,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Tag,
  Check,
  ChevronRight,
  Truck,
  RotateCcw,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { createManualAdminOrder } from "@/app/actions/order";
import { ThermalReceiptModal } from "@/components/admin/ThermalReceiptModal";
import { CustomerThermalReceiptModal } from "@/components/admin/CustomerThermalReceiptModal";
import { UpiQrModal } from "@/components/admin/UpiQrModal";
import type { AdminOrderWithItems } from "@/components/admin/AdminOrdersClient";
import { buildUpiUri } from "@/lib/upi";
import { QrCode } from "lucide-react";

export type UnitType = "kg" | "litre" | "piece" | "pack";

export interface CatalogueProduct {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  category_name: string;
  image_url: string | null;
  base_price: number;
  unit_type: UnitType;
  product_variants: {
    id: string;
    label: string;
    price: number;
    quantity_value: number;
    stock_quantity: number;
    is_available: boolean;
    is_auto_priced: boolean;
  }[];
}

export interface DeliveryAreaOption {
  id: string;
  area_name: string;
  pincode: string;
}

export interface CustomerContact {
  name: string;
  phone: string;
  email: string | null;
  city: string;
  address: string;
  pincode: string;
}

export interface CartItem {
  id: string; // unique temporary ID in cart
  productId: string;
  variantId: string | null;
  productName: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
  unitType: UnitType;
  basePrice: number;
  isCustomSize: boolean;
}

interface AdminNewOrderClientProps {
  products: CatalogueProduct[];
  categories: { id: string; name: string }[];
  deliveryAreas: DeliveryAreaOption[];
  pastCustomers: CustomerContact[];
  defaultDeliveryFee: number;
  userRole: "admin" | "staff";
  storeUpiId?: string;
  storeUpiName?: string;
  storePhone?: string;
}

const PRESET_WEIGHTS: Record<UnitType, { label: string; value: number; unit: string }[]> = {
  kg: [
    { label: "100g", value: 100, unit: "g" },
    { label: "250g", value: 250, unit: "g" },
    { label: "350g", value: 350, unit: "g" },
    { label: "500g", value: 500, unit: "g" },
    { label: "750g", value: 750, unit: "g" },
    { label: "1 kg", value: 1, unit: "kg" },
    { label: "1.5 kg", value: 1.5, unit: "kg" },
    { label: "2 kg", value: 2, unit: "kg" },
    { label: "3 kg", value: 3, unit: "kg" },
    { label: "5 kg", value: 5, unit: "kg" },
  ],
  litre: [
    { label: "100ml", value: 100, unit: "ml" },
    { label: "200ml", value: 200, unit: "ml" },
    { label: "250ml", value: 250, unit: "ml" },
    { label: "500ml", value: 500, unit: "ml" },
    { label: "750ml", value: 750, unit: "ml" },
    { label: "1 L", value: 1, unit: "L" },
    { label: "1.5 L", value: 1.5, unit: "L" },
    { label: "2 L", value: 2, unit: "L" },
    { label: "5 L", value: 5, unit: "L" },
  ],
  piece: [
    { label: "1 pc", value: 1, unit: "pcs" },
    { label: "2 pcs", value: 2, unit: "pcs" },
    { label: "3 pcs", value: 3, unit: "pcs" },
    { label: "4 pcs", value: 4, unit: "pcs" },
    { label: "6 pcs", value: 6, unit: "pcs" },
    { label: "12 pcs", value: 12, unit: "pcs" },
  ],
  pack: [
    { label: "1 pack", value: 1, unit: "packs" },
    { label: "2 packs", value: 2, unit: "packs" },
    { label: "3 packs", value: 3, unit: "packs" },
    { label: "4 packs", value: 4, unit: "packs" },
    { label: "5 packs", value: 5, unit: "packs" },
  ],
};

export function AdminNewOrderClient({
  products,
  categories,
  deliveryAreas,
  pastCustomers,
  defaultDeliveryFee,
  userRole,
  storeUpiId = "greenbasket@okaxis",
  storeUpiName = "Green Basket TCR",
  storePhone = "+91 90481 78886",
}: AdminNewOrderClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState("");

  // Customer & Delivery Information
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Thrissur Town");
  const [pincode, setPincode] = useState("680001");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderStatus, setOrderStatus] = useState<
    "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered"
  >("confirmed");
  const [isWhatsAppOrder, setIsWhatsAppOrder] = useState(true);

  // Delivery fee
  const [deliveryFee, setDeliveryFee] = useState<number>(defaultDeliveryFee);

  // Order Cart Items
  const [cart, setCart] = useState<CartItem[]>([]);

  // Product Catalogue Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Custom Weight / Size Calculator Modal State
  const [calculatorProduct, setCalculatorProduct] = useState<CatalogueProduct | null>(null);
  const [customValue, setCustomValue] = useState<string>("350");
  const [customUnit, setCustomUnit] = useState<string>("g");
  const [customMultiplier, setCustomMultiplier] = useState<number>(1);
  const [customPriceOverride, setCustomPriceOverride] = useState<string>("");

  // Autocomplete Suggestions
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);

  // Order Success & Modals
  const [createdOrderResult, setCreatedOrderResult] = useState<{
    orderNumber: string;
    orderId: string;
    createdOrder: AdminOrderWithItems;
  } | null>(null);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showCustomerBillModal, setShowCustomerBillModal] = useState(false);
  const [showFarmSlipModal, setShowFarmSlipModal] = useState(false);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "all" || p.category_id === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category_name.toLowerCase().includes(q) ||
        p.product_variants.some((v) => v.label.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Customer Autocomplete Filter
  const customerSuggestions = useMemo(() => {
    const q = phone.trim().toLowerCase() || customerName.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return pastCustomers
      .filter(
        (c) =>
          c.phone.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [pastCustomers, phone, customerName]);

  // Handle Customer Selection from Autocomplete
  const selectCustomer = (c: CustomerContact) => {
    setCustomerName(c.name);
    setPhone(c.phone);
    if (c.email) setEmail(c.email);
    if (c.address) setAddress(c.address);
    if (c.city) setCity(c.city);
    if (c.pincode) setPincode(c.pincode);
    setShowCustomerSuggestions(false);
  };

  // Add standard variant to cart
  const addStandardVariant = (
    product: CatalogueProduct,
    variant: CatalogueProduct["product_variants"][0]
  ) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.variantId === variant.id
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + 1,
        };
        return next;
      }
      return [
        ...prev,
        {
          id: `${product.id}-${variant.id}-${Date.now()}`,
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          variantLabel: variant.label,
          unitPrice: Number(variant.price),
          quantity: 1,
          imageUrl: product.image_url,
          unitType: product.unit_type,
          basePrice: product.base_price,
          isCustomSize: false,
        },
      ];
    });
  };

  // Open Custom Weight / Size Calculator for a product
  const openCalculator = (product: CatalogueProduct) => {
    setCalculatorProduct(product);
    setCustomMultiplier(1);
    setCustomPriceOverride("");

    if (product.unit_type === "kg") {
      setCustomValue("350");
      setCustomUnit("g");
    } else if (product.unit_type === "litre") {
      setCustomValue("250");
      setCustomUnit("ml");
    } else if (product.unit_type === "piece") {
      setCustomValue("3");
      setCustomUnit("pcs");
    } else {
      setCustomValue("2");
      setCustomUnit("packs");
    }
  };

  // Calculate price dynamically from base price and custom inputs
  const calculatedCustomResult = useMemo(() => {
    if (!calculatorProduct) {
      return { price: 0, label: "", valid: false, formula: "" };
    }

    const val = parseFloat(customValue);
    if (isNaN(val) || val <= 0) {
      return { price: 0, label: "", valid: false, formula: "Enter a valid size/weight" };
    }

    const base = Number(calculatorProduct.base_price) || 0;
    let normalizedQty = 1;
    let label = `${val} ${customUnit}`;

    if (calculatorProduct.unit_type === "kg") {
      if (customUnit === "g") {
        normalizedQty = val / 1000;
        label = val >= 1000 ? `${val / 1000}kg` : `${val}g`;
      } else {
        normalizedQty = val;
        label = `${val}kg`;
      }
    } else if (calculatorProduct.unit_type === "litre") {
      if (customUnit === "ml") {
        normalizedQty = val / 1000;
        label = val >= 1000 ? `${val / 1000}L` : `${val}ml`;
      } else {
        normalizedQty = val;
        label = `${val}L`;
      }
    } else if (calculatorProduct.unit_type === "piece") {
      normalizedQty = val;
      label = val === 1 ? "1 pc" : `${val} pcs`;
    } else if (calculatorProduct.unit_type === "pack") {
      normalizedQty = val;
      label = val === 1 ? "1 pack" : `${val} packs`;
    }

    const autoPrice = Math.round(base * normalizedQty * 100) / 100;
    const finalPrice =
      customPriceOverride !== "" && !isNaN(parseFloat(customPriceOverride))
        ? parseFloat(customPriceOverride)
        : autoPrice;

    const formula =
      calculatorProduct.unit_type === "kg" || calculatorProduct.unit_type === "litre"
        ? `₹${base}/${calculatorProduct.unit_type} × ${normalizedQty} ${calculatorProduct.unit_type} = ₹${autoPrice}`
        : `₹${base}/${calculatorProduct.unit_type} × ${val} = ₹${autoPrice}`;

    return {
      price: finalPrice,
      label,
      valid: true,
      formula,
      autoPrice,
      normalizedQty,
    };
  }, [calculatorProduct, customValue, customUnit, customPriceOverride]);

  // Add Custom calculated item to cart
  const addCustomItemToCart = () => {
    if (!calculatorProduct || !calculatedCustomResult.valid) return;

    setCart((prev) => [
      ...prev,
      {
        id: `custom-${calculatorProduct.id}-${Date.now()}`,
        productId: calculatorProduct.id,
        variantId: null, // Custom weight doesn't link to a fixed variant ID
        productName: calculatorProduct.name,
        variantLabel: calculatedCustomResult.label,
        unitPrice: calculatedCustomResult.price,
        quantity: Math.max(1, customMultiplier),
        imageUrl: calculatorProduct.image_url,
        unitType: calculatorProduct.unit_type,
        basePrice: calculatorProduct.base_price,
        isCustomSize: true,
      },
    ]);

    setCalculatorProduct(null);
  };

  // Cart operations
  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((i): i is CartItem => i !== null)
    );
  };

  const updateUnitPrice = (cartItemId: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice < 0) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, unitPrice: newPrice } : item
      )
    );
  };

  const removeItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  // Cart totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [cart]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal + (deliveryFee || 0));
  }, [subtotal, deliveryFee]);

  // Submit Order
  const handleCreateOrder = () => {
    setSubmitError("");

    if (!customerName.trim()) {
      setSubmitError("Please enter the customer's name.");
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setSubmitError("Please enter a valid 10-digit Indian phone number.");
      return;
    }

    if (!address.trim()) {
      setSubmitError("Please enter the delivery address.");
      return;
    }

    if (cart.length === 0) {
      setSubmitError("Please select and add at least one product to the order.");
      return;
    }

    startTransition(async () => {
      const result = await createManualAdminOrder({
        customer_name: customerName.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim() || "680001",
        notes: notes.trim(),
        payment_method: paymentMethod,
        order_status: orderStatus,
        isWhatsAppOrder: isWhatsAppOrder,
        items: cart.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantLabel: item.variantLabel,
          price: item.unitPrice,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
        })),
        subtotal: subtotal,
        deliveryFee: deliveryFee || 0,
        total: grandTotal,
      });

      if (!result.success) {
        setSubmitError(result.error);
        return;
      }

      // Success
      setCreatedOrderResult({
        orderNumber: result.orderNumber,
        orderId: result.orderId,
        createdOrder: result.createdOrder,
      });
    });
  };

  // Reset form to create another order
  const resetForm = () => {
    setCustomerName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setNotes("");
    setCart([]);
    setCreatedOrderResult(null);
  };

  // Generate WhatsApp confirmation message link
  const getWhatsAppConfirmationUrl = () => {
    if (!createdOrderResult) return "#";
    const cleanP = phone.trim().replace(/\D/g, "");
    const itemsList = cart
      .map(
        (i) => `• *${i.productName}* (${i.variantLabel}) x ${i.quantity} — ${formatPrice(i.unitPrice * i.quantity)}`
      )
      .join("\n");

    const upiPayLink = buildUpiUri({
      upiId: storeUpiId,
      payeeName: storeUpiName,
      amount: grandTotal,
      orderNumber: createdOrderResult.orderNumber,
    });

    const isPaid = paymentMethod === "upi_paid" || paymentMethod === "razorpay";
    const paymentSection = isPaid
      ? `*Payment Status:* PAID (${paymentMethod.toUpperCase()})`
      : `*Payment:* ${paymentMethod.toUpperCase()}\n\n💳 *Pay Online via UPI (${formatPrice(grandTotal)} locked):*\n👉 ${upiPayLink}\n\n*Store UPI ID:* \`${storeUpiId}\`\n_(Please share payment screenshot here after paying)_`;

    const message = `🌿 *Green Basket TCR — Order Confirmation* 🌿\n\n` +
      `Hello *${customerName}*,\nYour manual/WhatsApp order has been placed successfully!\n\n` +
      `📦 *Order Number:* ${createdOrderResult.orderNumber}\n` +
      `📍 *Delivery To:* ${address}, ${city}\n\n` +
      `🛒 *Items Ordered:*\n${itemsList}\n\n` +
      `--------------------------------\n` +
      `Subtotal: ${formatPrice(subtotal)}\n` +
      `Delivery Charge: ${deliveryFee > 0 ? formatPrice(deliveryFee) : "FREE"}\n` +
      `*Total Payable: ${formatPrice(grandTotal)}*\n` +
      `--------------------------------\n\n` +
      `${paymentSection}\n\n` +
      `We are preparing your fresh farm order with care. Thank you for choosing Green Basket! 🌱`;

    return `https://wa.me/91${cleanP}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 transition-colors"
            title="Back to Orders"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Create Manual / WhatsApp Order
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {userRole === "admin" ? "Admin POS" : "Staff POS"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Take incoming WhatsApp or telephone orders, choose or calculate custom product weights & record instantly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
          >
            <RotateCcw size={14} />
            <span>Reset Form</span>
          </button>
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm flex items-start gap-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1">
            <p className="font-bold">Error creating order</p>
            <p className="text-xs text-red-600 mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Customer Info & Product Catalogue (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Customer Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-gb-charcoal">
                <User size={18} className="text-gb-green" />
                <h2 className="font-bold text-sm sm:text-base">Customer & Delivery Details</h2>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full cursor-pointer">
                <input
                  type="checkbox"
                  checked={isWhatsAppOrder}
                  onChange={(e) => setIsWhatsAppOrder(e.target.checked)}
                  className="rounded text-gb-green focus:ring-gb-green"
                />
                <span>WhatsApp Customer</span>
              </label>
            </div>

            {/* Phone Number with Autocomplete lookup */}
            <div className="relative">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Customer Mobile / WhatsApp Number *
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setShowCustomerSuggestions(true);
                  }}
                  onFocus={() => setShowCustomerSuggestions(true)}
                  placeholder="e.g. 9876543210 (Type to search past customers)"
                  className="gb-input !pl-10 text-xs py-2.5 w-full bg-gray-50/60 focus:bg-white"
                  style={{ paddingLeft: "2.4rem" }}
                />
              </div>

              {/* Autocomplete Dropdown */}
              {showCustomerSuggestions && customerSuggestions.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden divide-y divide-gray-100">
                  <div className="p-2 bg-emerald-50/70 text-[11px] font-bold text-emerald-800 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Sparkles size={13} />
                      Found {customerSuggestions.length} returning customer(s)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCustomerSuggestions(false)}
                      className="text-gray-400 hover:text-gray-600 text-xs"
                    >
                      Close
                    </button>
                  </div>
                  {customerSuggestions.map((c, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectCustomer(c)}
                      className="w-full text-left p-2.5 hover:bg-emerald-50/50 transition-colors flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{c.name}</p>
                        <p className="text-[11px] text-gray-500">
                          {c.phone} • {c.city || "Thrissur"}
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-gb-green bg-emerald-100 px-2 py-0.5 rounded-md">
                        Auto-Fill
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Menon"
                  className="gb-input text-xs py-2.5 w-full bg-gray-50/60 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="gb-input text-xs py-2.5 w-full bg-gray-50/60 focus:bg-white"
                />
              </div>
            </div>

            {/* Delivery Address & City / Pincode */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Delivery Address / House / Landmark *
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House No, Apartment/Street name, Landmark..."
                  className="gb-input text-xs py-2 w-full bg-gray-50/60 focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Delivery Area / City *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCity(val);
                      const matched = deliveryAreas.find((a) => a.area_name === val);
                      if (matched?.pincode) setPincode(matched.pincode);
                    }}
                    className="gb-input text-xs py-2.5 w-full bg-gray-50/60 focus:bg-white"
                  >
                    {deliveryAreas.map((area) => (
                      <option key={area.id} value={area.area_name}>
                        {area.area_name} ({area.pincode})
                      </option>
                    ))}
                    <option value="Thrissur Town">Thrissur Town (Other)</option>
                    <option value="Store Pickup">Farm / Store Pickup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="680001"
                    className="gb-input text-xs py-2.5 w-full bg-gray-50/60 focus:bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Payment Mode, Status & Order Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="gb-input text-xs py-2.5 w-full bg-gray-50/60 focus:bg-white"
                >
                  <option value="cod">Cash on Delivery (COD)</option>
                  <option value="upi_whatsapp">WhatsApp UPI / GPay (Pending)</option>
                  <option value="upi_paid">UPI / GPay (Already Paid)</option>
                  <option value="cash_store">Cash at Farm / Store</option>
                  <option value="bank_transfer">Direct Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Order Status
                </label>
                <select
                  value={orderStatus}
                  onChange={(e) =>
                    setOrderStatus(
                      e.target.value as
                        | "pending"
                        | "confirmed"
                        | "preparing"
                        | "out_for_delivery"
                        | "delivered"
                    )
                  }
                  className="gb-input text-xs py-2.5 w-full bg-gray-50/60 focus:bg-white"
                >
                  <option value="confirmed">Confirmed (Default for WhatsApp)</option>
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing / Packing</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                WhatsApp Notes / Customer Special Instructions
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Needs ripe papaya, deliver after 4 PM, call on arrival"
                className="gb-input text-xs py-2 w-full bg-gray-50/60 focus:bg-white"
              />
            </div>
          </div>

          {/* Card 2: Product Catalogue Selector */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-gb-charcoal">
                <ShoppingBag size={18} className="text-gb-green" />
                <h2 className="font-bold text-sm sm:text-base">Product Catalogue & Weights</h2>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {filteredProducts.length} items available
              </span>
            </div>

            {/* Search & Category Filter Pills */}
            <div className="space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by name, category or unit..."
                  className="gb-input !pl-10 text-xs py-2.5 w-full bg-gray-50/60 focus:bg-white"
                  style={{ paddingLeft: "2.5rem" }}
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all ${
                    selectedCategory === "all"
                      ? "bg-gb-green text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all ${
                      selectedCategory === cat.id
                        ? "bg-gb-green text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Product List / Cards */}
            <div className="divide-y divide-gray-100 max-h-[520px] overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <ShoppingBag size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">No products match your search</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/60 p-2 rounded-xl transition-colors"
                  >
                    {/* Left: Thumbnail & Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 relative overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <ShoppingBag size={20} className="text-gray-300" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                            {product.name}
                          </h3>
                          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {product.category_name}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-700 font-extrabold mt-0.5">
                          Base: {formatPrice(product.base_price)} / {product.unit_type}
                        </p>
                      </div>
                    </div>

                    {/* Right: Variants + Custom Size Button */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0 justify-start sm:justify-end">
                      {product.product_variants.map((variant) => (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => addStandardVariant(product, variant)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200/60 transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
                          title={`Add ${variant.label} for ${formatPrice(variant.price)}`}
                        >
                          <Plus size={12} className="text-emerald-600" />
                          <span>{variant.label}</span>
                          <span className="font-mono text-emerald-900 font-black">
                            {formatPrice(variant.price)}
                          </span>
                        </button>
                      ))}

                      {/* Interactive Custom Weight / Size Button */}
                      <button
                        type="button"
                        onClick={() => openCalculator(product)}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold rounded-lg border border-amber-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
                        title="Calculate custom weight or quantity (e.g. 350g, 2.5kg, 250ml)"
                      >
                        <Calculator size={13} className="text-amber-600" />
                        <span>+ Custom Size</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Cart & Checkout Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-gb-charcoal">
                <ShoppingBag size={18} className="text-gb-green" />
                <h2 className="font-bold text-sm sm:text-base">Order Cart Items</h2>
              </div>
              <span className="text-xs font-bold text-gb-green bg-emerald-50 px-2.5 py-0.5 rounded-full">
                {cart.length} line items
              </span>
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-12 px-4 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                <ShoppingBag size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-xs sm:text-sm font-bold text-gray-700">Order Basket is Empty</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  Click on any product size (e.g. 500g, 1kg) or click &quot;+ Custom Size&quot; to calculate custom portions like 350g.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-gray-50/70 border border-gray-100 rounded-xl flex items-center justify-between gap-2 text-xs"
                  >
                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-gray-900 truncate">
                          {item.productName}
                        </p>
                        {item.isCustomSize && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded shrink-0">
                            Custom
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-extrabold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md text-[11px]">
                          {item.variantLabel}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">@</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateUnitPrice(item.id, parseFloat(e.target.value) || 0)
                            }
                            className="w-16 px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[11px] font-bold text-gray-900 text-right focus:border-gb-green focus:outline-hidden"
                            title="Edit Unit Price for this item"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-1.5 font-bold text-gray-900 text-xs min-w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Line Total & Remove */}
                    <div className="text-right shrink-0 min-w-16">
                      <p className="font-black text-gray-900 font-mono text-xs">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 transition-colors mt-0.5"
                        title="Remove item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bill Breakdown Summary */}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-mono font-bold text-gray-900">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between gap-2 text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Truck size={14} className="text-gray-400" />
                  <span>Delivery Charge</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDeliveryFee(0)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      deliveryFee === 0
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Free
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryFee(40)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      deliveryFee === 40
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    ₹40
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 px-1.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-mono font-bold text-right"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-sm">
                <span className="font-bold text-gray-900">Total Payable</span>
                <span className="font-black text-gb-green text-lg font-mono">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              disabled={isPending || cart.length === 0}
              onClick={handleCreateOrder}
              className="w-full py-3.5 px-4 bg-gb-green hover:bg-gb-green/90 text-white font-bold rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm"
            >
              {isPending ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Creating & Recording Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Create & Place Order ({formatPrice(grandTotal)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Custom Weight & Size Calculator */}
      {calculatorProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-gb-green flex items-center justify-center shrink-0">
                  <Calculator size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Custom Weight & Size Calculator
                  </h3>
                  <p className="text-xs text-gray-500">
                    Product: <strong className="text-gray-800">{calculatorProduct.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCalculatorProduct(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Base Price Reference */}
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-500 font-medium">Product Base Rate:</span>
                <p className="font-extrabold text-emerald-900 text-sm">
                  {formatPrice(calculatorProduct.base_price)} per {calculatorProduct.unit_type}
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full uppercase">
                {calculatorProduct.unit_type} basis
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Quick Preset Sizes / Weights:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(PRESET_WEIGHTS[calculatorProduct.unit_type] || []).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCustomValue(preset.value.toString());
                      setCustomUnit(preset.unit);
                      setCustomPriceOverride("");
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                      customValue === preset.value.toString() && customUnit === preset.unit
                        ? "bg-gb-green text-white border-gb-green shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Numeric Entry */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                Enter Custom Weight / Quantity:
              </label>
              <div className="grid grid-cols-12 gap-2.5">
                {/* Large Numeric Input (7 to 8 cols ~ 65-70% width) */}
                <div className="col-span-7 sm:col-span-8">
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={customValue}
                    onChange={(e) => {
                      setCustomValue(e.target.value);
                      setCustomPriceOverride("");
                    }}
                    placeholder="e.g. 350"
                    className="w-full h-12 px-3.5 bg-gray-50 border-2 border-gray-200 focus:border-gb-green focus:bg-white focus:outline-none rounded-2xl text-lg sm:text-xl font-black font-mono text-gray-900 shadow-inner transition-colors"
                  />
                </div>

                {/* Unit Selector / Badge (4 to 5 cols ~ 30-35% width) */}
                <div className="col-span-5 sm:col-span-4">
                  {calculatorProduct.unit_type === "kg" && (
                    <select
                      value={customUnit}
                      onChange={(e) => {
                        setCustomUnit(e.target.value);
                        setCustomPriceOverride("");
                      }}
                      className="w-full h-12 px-3 bg-gray-100 hover:bg-gray-200/70 border-2 border-gray-200 focus:border-gb-green focus:outline-none rounded-2xl text-xs sm:text-sm font-bold text-gray-900 cursor-pointer transition-colors"
                    >
                      <option value="g">Grams (g)</option>
                      <option value="kg">Kilograms (kg)</option>
                    </select>
                  )}

                  {calculatorProduct.unit_type === "litre" && (
                    <select
                      value={customUnit}
                      onChange={(e) => {
                        setCustomUnit(e.target.value);
                        setCustomPriceOverride("");
                      }}
                      className="w-full h-12 px-3 bg-gray-100 hover:bg-gray-200/70 border-2 border-gray-200 focus:border-gb-green focus:outline-none rounded-2xl text-xs sm:text-sm font-bold text-gray-900 cursor-pointer transition-colors"
                    >
                      <option value="ml">Millilitres (ml)</option>
                      <option value="L">Litres (L)</option>
                    </select>
                  )}

                  {calculatorProduct.unit_type === "piece" && (
                    <div className="w-full h-12 flex items-center justify-center bg-gray-100 border-2 border-gray-200 rounded-2xl text-xs sm:text-sm font-bold text-gray-700">
                      Pieces (pcs)
                    </div>
                  )}

                  {calculatorProduct.unit_type === "pack" && (
                    <div className="w-full h-12 flex items-center justify-center bg-gray-100 border-2 border-gray-200 rounded-2xl text-xs sm:text-sm font-bold text-gray-700">
                      Packs
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Real-Time Price Calculation Banner */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                    Calculated Size & Price
                  </span>
                  <p className="text-sm font-extrabold text-gray-900 mt-0.5">
                    Portion: <span className="text-gb-green">{calculatedCustomResult.label}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Unit Price</span>
                  <p className="text-lg font-black text-amber-900 font-mono">
                    {formatPrice(calculatedCustomResult.price)}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-amber-700 font-mono">
                Formula: {calculatedCustomResult.formula}
              </p>

              {/* Optional Price Override */}
              <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center justify-between text-xs gap-2">
                <span className="text-gray-600 font-semibold">Adjust / Override Price (₹):</span>
                <input
                  type="number"
                  step="any"
                  value={customPriceOverride}
                  onChange={(e) => setCustomPriceOverride(e.target.value)}
                  placeholder={`Auto: ${calculatedCustomResult.autoPrice}`}
                  className="w-32 h-9 px-2.5 bg-white border border-amber-300 focus:border-amber-500 focus:outline-none rounded-xl text-xs font-mono font-bold text-right text-gray-900"
                />
              </div>
            </div>

            {/* Pack Multiplier */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700">Number of packets / portions:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCustomMultiplier((m) => Math.max(1, m - 1))}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700"
                >
                  -
                </button>
                <span className="font-bold text-sm font-mono min-w-6 text-center">
                  {customMultiplier}
                </span>
                <button
                  type="button"
                  onClick={() => setCustomMultiplier((m) => m + 1)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700"
                >
                  +
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCalculatorProduct(null)}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!calculatedCustomResult.valid}
                onClick={addCustomItemToCart}
                className="px-5 py-2.5 bg-gb-green hover:bg-gb-green/90 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                Add {calculatedCustomResult.label} ({formatPrice(calculatedCustomResult.price * customMultiplier)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Order Created Successfully! */}
      {createdOrderResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 text-center space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="text-xl font-black text-gray-900">Order Placed Successfully!</h3>
              <p className="text-xs text-gray-500 mt-1">
                Order Number:{" "}
                <strong className="text-gb-green font-mono text-sm">
                  {createdOrderResult.orderNumber}
                </strong>
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 text-left text-xs space-y-1.5 border border-gray-100">
              <p className="text-gray-600">
                <strong>Customer:</strong> {customerName} ({phone})
              </p>
              <p className="text-gray-600">
                <strong>Delivery Area:</strong> {city}
              </p>
              <p className="text-gray-600">
                <strong>Items:</strong> {cart.length} product(s)
              </p>
              <p className="text-gray-900 font-bold">
                <strong>Grand Total:</strong> {formatPrice(grandTotal)} ({paymentMethod.toUpperCase()})
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              {/* WhatsApp Invoice Sender */}
              <a
                href={getWhatsAppConfirmationUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs shadow-sm transition-all hover:scale-[1.02]"
              >
                <MessageCircle size={16} />
                <span>Send WhatsApp Invoice to Customer</span>
              </a>

              {/* View & Share UPI Payment QR */}
              <button
                type="button"
                onClick={() => setShowUpiModal(true)}
                className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold rounded-xl flex items-center justify-center gap-2 text-xs transition-colors"
              >
                <QrCode size={15} className="text-emerald-700" />
                <span>View & Share UPI Payment QR ({formatPrice(grandTotal)})</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* 58mm Customer Bill Print */}
                <button
                  type="button"
                  onClick={() => setShowCustomerBillModal(true)}
                  className="py-2.5 px-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs transition-colors"
                  title="Print customer receipt with prices"
                >
                  <Printer size={14} />
                  <span>58mm Customer Bill</span>
                </button>

                {/* 58mm Farm Picking Slip */}
                <button
                  type="button"
                  onClick={() => setShowFarmSlipModal(true)}
                  className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs transition-colors"
                  title="Print farm packing slip without customer pricing"
                >
                  <Printer size={14} />
                  <span>58mm Farm Slip</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors"
                >
                  Create Another Order
                </button>
                <Link
                  href="/admin/orders"
                  className="flex-1 py-2.5 px-3 bg-gb-green hover:bg-gb-green/90 text-white font-bold rounded-xl text-xs transition-colors text-center"
                >
                  View in Orders List
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Dynamic Amount UPI QR Modal (Manual Orders) */}
      {showUpiModal && createdOrderResult && (
        <UpiQrModal
          isOpen={showUpiModal}
          onClose={() => setShowUpiModal(false)}
          orderNumber={createdOrderResult.orderNumber}
          amount={grandTotal}
          customerName={customerName}
          customerPhone={phone}
          upiId={storeUpiId}
          payeeName={storeUpiName}
        />
      )}

      {/* 2. Customer 58mm Thermal Bill Modal (With Prices) */}
      {showCustomerBillModal && createdOrderResult && (
        <CustomerThermalReceiptModal
          order={createdOrderResult.createdOrder}
          onClose={() => setShowCustomerBillModal(false)}
          storePhone={storePhone}
        />
      )}

      {/* 3. Farm 58mm Picking Slip (Untouched Existing Farm Slip) */}
      {showFarmSlipModal && createdOrderResult && (
        <ThermalReceiptModal
          order={createdOrderResult.createdOrder}
          onClose={() => setShowFarmSlipModal(false)}
          storePhone={storePhone}
        />
      )}
    </div>
  );
}
