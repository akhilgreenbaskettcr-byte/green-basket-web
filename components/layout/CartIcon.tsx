"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useEffect, useState } from "react";

export function CartIcon() {
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount)();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link
      href="/cart"
      className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
      aria-label={`Cart${mounted && itemCount > 0 ? ` (${itemCount} items)` : ""}`}
    >
      <ShoppingCart size={20} className="text-gb-charcoal" aria-hidden="true" />
      {mounted && itemCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 bg-gb-green text-white text-xs font-bold rounded-full leading-none"
          aria-hidden="true"
        >
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </Link>
  );
}
