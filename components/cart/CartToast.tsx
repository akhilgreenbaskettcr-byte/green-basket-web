"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";
import { CheckCircle2, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export function CartToast() {
  const { lastAddedItem, clearLastAdded, openCart } = useCartStore();

  useEffect(() => {
    if (!lastAddedItem) return;

    const timer = setTimeout(() => {
      clearLastAdded();
    }, 4000);

    return () => clearTimeout(timer);
  }, [lastAddedItem, clearLastAdded]);

  if (!lastAddedItem) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-gb-charcoal text-white rounded-2xl p-4 shadow-2xl border border-gray-700/60 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 min-w-0">
        <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-white truncate">
            Added to basket!
          </p>
          <p className="text-[11px] text-gray-300 truncate">
            {lastAddedItem.productName} ({lastAddedItem.variantLabel}) —{" "}
            <span className="text-lime-300 font-bold font-mono">
              {formatPrice(lastAddedItem.price)}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            clearLastAdded();
            openCart();
          }}
          className="text-xs font-bold text-gb-green bg-white hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors uppercase tracking-tight"
        >
          VIEW
        </button>
        <button
          type="button"
          onClick={clearLastAdded}
          className="text-gray-400 hover:text-white p-1"
          aria-label="Dismiss toast"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
