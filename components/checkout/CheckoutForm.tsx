"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { createOrder } from "@/app/actions/order";
import { formatPrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";

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

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

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
  }, []);

  if (!mounted) return null;

  const sub = subtotal();
  const delivery = sub >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const total = sub + delivery;

  if (items.length === 0 && mounted) {
    router.push("/cart");
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (form.customer_name.length < 2) newErrors.customer_name = "Name must be at least 2 characters";
    if (!/^[6-9]\d{9}$/.test(form.phone)) newErrors.phone = "Enter a valid 10-digit Indian mobile number";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Enter a valid email";
    if (form.address.length < 10) newErrors.address = "Please enter a complete address";
    if (form.city.length < 2) newErrors.city = "City is required";
    if (!/^\d{6}$/.test(form.pincode)) newErrors.pincode = "Enter a valid 6-digit pincode";

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
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields: Array<{
    name: keyof FormData;
    label: string;
    type?: string;
    placeholder: string;
    required?: boolean;
    textarea?: boolean;
    rows?: number;
  }> = [
    { name: "customer_name", label: "Full Name", placeholder: "Your full name", required: true },
    { name: "phone", label: "Phone Number", type: "tel", placeholder: "10-digit mobile number", required: true },
    { name: "email", label: "Email", type: "email", placeholder: "your@email.com (optional)" },
    { name: "address", label: "Delivery Address", placeholder: "House/flat no., street, area, landmark", required: true, textarea: true, rows: 3 },
    { name: "city", label: "City", placeholder: "City", required: true },
    { name: "pincode", label: "Pincode", placeholder: "6-digit pincode", required: true },
    { name: "notes", label: "Delivery Notes", placeholder: "Any special instructions? (optional)", textarea: true, rows: 2 },
  ];

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Left — Form */}
        <div className="lg:col-span-2 space-y-5 mb-8 lg:mb-0">
          <div className="bg-white rounded-2xl border border-gb-border p-6">
            <h2 className="font-semibold text-gb-charcoal text-base mb-5">
              Delivery Details
            </h2>

            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="gb-label">
                    {field.label}
                    {field.required && (
                      <span className="text-red-400 ml-1" aria-hidden="true">
                        *
                      </span>
                    )}
                  </label>
                  {field.textarea ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      rows={field.rows ?? 3}
                      className={`gb-input resize-none ${errors[field.name] ? "!border-red-400" : ""}`}
                      aria-required={field.required}
                      aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                    />
                  ) : (
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type ?? "text"}
                      value={form[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className={`gb-input ${errors[field.name] ? "!border-red-400" : ""}`}
                      aria-required={field.required}
                      aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                    />
                  )}
                  {errors[field.name] && (
                    <p
                      id={`${field.name}-error`}
                      className="text-red-500 text-xs mt-1"
                      role="alert"
                    >
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-800 text-sm font-medium mb-1">
              💰 Cash on Delivery
            </p>
            <p className="text-amber-700 text-xs leading-relaxed">
              We currently accept Cash on Delivery. Pay when your order arrives.
              Online payment options coming soon.
            </p>
          </div>
        </div>

        {/* Right — Summary */}
        <div>
          <div className="bg-white rounded-2xl border border-gb-border p-6 sticky top-24">
            <h2 className="font-semibold text-gb-charcoal text-base mb-4">
              Order Summary
            </h2>

            {/* Items list */}
            <div className="space-y-3 mb-5 max-h-48 overflow-y-auto">
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

            <div className="border-t border-gb-border pt-4 space-y-3 mb-5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gb-charcoal">{formatPrice(sub)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery</span>
                <span className="font-medium text-gb-charcoal">
                  {delivery === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatPrice(delivery)
                  )}
                </span>
              </div>
            </div>

            <div className="border-t border-gb-border pt-4 mb-5">
              <div className="flex justify-between">
                <span className="font-semibold text-gb-charcoal">Total</span>
                <span className="font-bold text-gb-charcoal text-lg">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4" role="alert">
                <p className="text-red-600 text-sm">{serverError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
              id="place-order-btn"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Placing Order…
                </>
              ) : (
                "Place Order"
              )}
            </button>

            <Link
              href="/cart"
              className="block text-center text-sm text-gray-500 hover:text-gb-green transition-colors mt-3"
            >
              ← Edit Cart
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
