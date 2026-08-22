"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";

export function CartSlideOver() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, itemCount } =
    useCartStore();

  const totalAmount = subtotal();
  const totalCount = itemCount();

  // Free shipping threshold (e.g. ₹500)
  const FREE_SHIPPING_THRESHOLD = 500;
  const progressPercent = Math.min(100, Math.round((totalAmount / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalAmount);

  // Close on Escape key press
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    },
    [isOpen, closeCart]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <aside className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-gb-green" />
            <h2 className="font-extrabold text-base text-gb-charcoal uppercase tracking-wider">
              YOUR BASKET ({totalCount})
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close cart drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="px-5 py-3 bg-[#FAFAF5] border-b border-gray-200/60">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1.5">
            <span>
              {remainingForFreeShipping === 0 ? (
                <span className="text-gb-green font-bold flex items-center gap-1">
                  <ShieldCheck size={14} /> You unlocked FREE Same-Day Delivery!
                </span>
              ) : (
                <span>
                  Add <strong className="text-gb-green">{formatPrice(remainingForFreeShipping)}</strong> more for FREE delivery
                </span>
              )}
            </span>
            <span className="text-[11px] text-gray-400 font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gb-green h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-gb-green">
                <ShoppingBag size={28} />
              </div>
              <p className="font-bold text-gray-800 text-base">Your basket is empty</p>
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                Add fresh cut vegetables, stone-ground powders, or cold-pressed oils to get started.
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="btn-primary text-xs px-6 py-2.5 mt-2"
              >
                START SHOPPING
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.variantId} className="pt-4 first:pt-0 flex gap-3.5 items-start">
                {/* Thumbnail */}
                <div className="relative w-16 h-16 rounded-xl bg-[#FAFAF5] border border-gray-100 shrink-0 overflow-hidden flex items-center justify-center p-1">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      sizes="64px"
                      className="object-contain p-1 mix-blend-multiply select-none"
                    />
                  ) : (
                    <ShoppingBag size={20} className="text-gray-300" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs font-bold text-gray-900 truncate leading-snug">
                    {item.productName}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Variant: <span className="text-gb-green font-semibold">{item.variantLabel}</span>
                  </p>
                  <p className="text-xs font-extrabold text-gb-charcoal">
                    {formatPrice(item.price * item.quantity)}
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="w-7 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold font-mono">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="w-7 h-6 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-white space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 font-semibold">Subtotal</span>
              <span className="font-black text-lg text-gb-charcoal font-mono">
                {formatPrice(totalAmount)}
              </span>
            </div>

            <p className="text-[11px] text-gray-400">
              Taxes and delivery calculated at checkout.
            </p>

            <div className="space-y-2 pt-1">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-wider shadow-sm"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight size={15} />
              </Link>

              <Link
                href="/cart"
                onClick={closeCart}
                className="w-full py-2 flex items-center justify-center text-xs font-bold text-gray-600 hover:text-gb-green hover:underline uppercase tracking-wide transition-colors"
              >
                VIEW FULL BASKET
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
