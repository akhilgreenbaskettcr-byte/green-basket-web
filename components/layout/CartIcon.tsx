"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useEffect, useState } from "react";

export function CartIcon() {
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount)();
  const openCart = useCartStore((s) => s.openCart);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      type="button"
      onClick={openCart}
      className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
      aria-label={`Open Basket${mounted && itemCount > 0 ? ` (${itemCount} items)` : ""}`}
    >
      <ShoppingBag size={20} className="text-gb-charcoal" aria-hidden="true" />
      {mounted && itemCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 bg-gb-green text-white text-[10px] font-bold rounded-full leading-none shadow-2xs animate-in zoom-in-75 duration-200"
          aria-hidden="true"
        >
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </button>
  );
}
