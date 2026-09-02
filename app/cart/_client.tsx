"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";

interface CartPageContentProps {
  defaultDeliveryFee?: number;
}

export default function CartPageContent({ defaultDeliveryFee = 40 }: CartPageContentProps) {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const sub = subtotal();
  const delivery = Math.max(0, defaultDeliveryFee);
  const total = sub + delivery;
  const count = itemCount();

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gb-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gb-green border-t-transparent rounded-full animate-spin" aria-label="Loading cart" />
      </main>
    );
  }

  return (
    <main id="main-content" className="min-h-screen bg-gb-cream">
      <div className="gb-container py-10 md:py-14">
        {/* Back link */}
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gb-green transition-colors mb-6"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Continue Shopping
        </Link>

        <h1 className="text-3xl font-bold text-gb-charcoal mb-8">
          Your Cart
          {count > 0 && (
            <span className="text-gray-400 font-normal text-xl ml-3">
              ({count} {count === 1 ? "item" : "items"})
            </span>
          )}
        </h1>

        {count === 0 ? (
          <div className="text-center py-24">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: "#e8f5ee" }}
              aria-hidden="true"
            >
              <ShoppingCart size={32} style={{ color: "#245B35" }} />
            </div>
            <h2 className="text-xl font-semibold text-gb-charcoal mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-400 text-sm mb-8">
              Add some fresh products to get started.
            </p>
            <Link href="/categories" className="btn-primary">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4 mb-8 lg:mb-0">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="bg-white rounded-2xl border border-gb-border p-4 flex gap-4"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.productName} fill sizes="80px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gb-cream-dark">
                        <ShoppingCart size={20} className="text-gray-300" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.slug}`} className="font-semibold text-gb-charcoal text-sm hover:text-gb-green transition-colors leading-tight block mb-1">
                      {item.productName}
                    </Link>
                    <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-3" style={{ backgroundColor: "#245B35", color: "white" }}>
                      {item.variantLabel}
                    </span>

                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors" aria-label={`Decrease quantity for ${item.productName}`}>
                          <Minus size={12} className="text-gray-500" aria-hidden="true" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-gb-charcoal" aria-label={`Quantity: ${item.quantity}`} aria-live="polite">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors" aria-label={`Increase quantity for ${item.productName}`}>
                          <Plus size={12} className="text-gray-500" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gb-charcoal text-sm">{formatPrice(item.price * item.quantity)}</span>
                        <button onClick={() => removeItem(item.variantId)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" aria-label={`Remove ${item.productName} from cart`}>
                          <Trash2 size={14} className="text-red-400" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div>
              <div className="bg-white rounded-2xl border border-gb-border p-6 sticky top-24">
                <h2 className="font-semibold text-gb-charcoal text-base mb-5">Order Summary</h2>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gb-charcoal">{formatPrice(sub)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery</span>
                    <span className="font-medium text-gb-charcoal">
                      {delivery === 0 ? (
                        <span className="text-emerald-700 font-bold">FREE</span>
                      ) : (
                        formatPrice(delivery)
                      )}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gb-border pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gb-charcoal">Total</span>
                    <span className="font-bold text-gb-charcoal text-lg">{formatPrice(total)}</span>
                  </div>
                </div>

                <Link href="/checkout" className="btn-primary w-full text-center block" id="proceed-to-checkout-btn">
                  Proceed to Checkout
                </Link>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  Secure checkout
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
