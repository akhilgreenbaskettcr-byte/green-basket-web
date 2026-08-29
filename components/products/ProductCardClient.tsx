"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import type { ProductWithVariants, ProductVariant } from "@/types/database";
import { ShoppingCart, Check, Leaf, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardClientProps {
  product: ProductWithVariants;
}

export function ProductCardClient({ product }: ProductCardClientProps) {
  const availableVariants = product.product_variants.filter((v) => v.is_available);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    availableVariants[0]
  );
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      variantLabel: selectedVariant.label,
      price: selectedVariant.price,
      imageUrl: product.image_url,
      slug: product.slug,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  if (!selectedVariant) return null;

  const category = product.categories;
  const isVegetables = product.slug.includes("cut") || product.slug.includes("coconut");

  return (
    <div className="product-card group flex flex-col h-full bg-white rounded-none border border-gray-200 shadow-2xs hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Poster Image Container */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative aspect-square overflow-hidden bg-[#FAFAF5] flex items-center justify-center p-4 rounded-none"
        tabIndex={-1}
        aria-hidden="true"
      >
        {/* Floating Brand Badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {product.is_featured && (
            <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Sparkles size={10} /> Bestseller
            </span>
          )}
          <span className="bg-white/90 backdrop-blur-xs text-gb-green text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs border border-gray-100 flex items-center gap-1">
            <Leaf size={10} /> {isVegetables ? "Freshly Cut" : "100% Pure"}
          </span>
        </div>

        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300 mix-blend-multiply select-none"
            unoptimized={product.image_url.startsWith("data:")}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
      </Link>

      {/* Info Body */}
      <div className="p-3 sm:p-5 flex flex-col flex-1 bg-white">
        {category && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-gb-olive mb-1 font-mono">
            {category.name}
          </p>
        )}

        <Link href={`/products/${product.slug}`} className="group-hover:text-gb-green transition-colors">
          <h3 className="font-bold text-gray-900 text-xs sm:text-base leading-snug mb-1 line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2 flex-1 hidden sm:block">
            {product.description}
          </p>
        )}

        {/* Size / Variant Selector */}
        {availableVariants.length > 1 && (
          <div className="flex flex-wrap gap-1 mb-3.5" role="group" aria-label="Select package size">
            {availableVariants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedVariant(v);
                }}
                className={cn(
                  "text-[10px] sm:text-[11px] font-semibold py-0.5 px-2 sm:py-1 sm:px-2.5 rounded-lg border transition-all cursor-pointer",
                  v.id === selectedVariant.id
                    ? "bg-gb-green text-white border-gb-green shadow-2xs font-bold"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gb-green"
                )}
                aria-pressed={v.id === selectedVariant.id}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        {availableVariants.length === 1 && (
          <div className="mb-3.5">
            <span className="text-[10px] sm:text-[11px] font-semibold py-0.5 px-2 rounded-md bg-green-50 text-gb-green border border-green-100">
              Pack: {selectedVariant.label}
            </span>
          </div>
        )}

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 mt-auto pt-2.5 sm:pt-3 border-t border-gray-100">
          <div>
            <p className="text-[9px] sm:text-[10px] text-gray-400 font-semibold uppercase">Price</p>
            <span className="font-black text-gray-900 text-sm sm:text-lg leading-none">
              {formatPrice(selectedVariant.price)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={cn(
              "flex items-center justify-center gap-1 sm:gap-1.5 text-xs font-bold px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 shrink-0",
              added
                ? "bg-emerald-600 text-white"
                : "bg-gb-green text-white hover:bg-gb-green-dark"
            )}
            aria-label={`Add ${product.name} to basket`}
            id={`add-to-cart-${product.id}-${selectedVariant.id}`}
          >
            {added ? (
              <>
                <Check size={13} aria-hidden="true" />
                <span className="text-[11px] sm:text-xs">Added</span>
              </>
            ) : (
              <>
                <ShoppingCart size={13} aria-hidden="true" />
                <span className="text-[11px] sm:text-xs">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
