"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import type { ProductWithVariants, ProductVariant } from "@/types/database";
import { ShoppingCart, Check, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardClientProps {
  product: ProductWithVariants;
}

export function ProductCardClient({ product }: ProductCardClientProps) {
  const availableVariants = product.product_variants?.filter((v) => v.is_available) || [];

  const isVariantInStock = (v?: ProductVariant | null) =>
    Boolean(v && v.is_available && (v.stock_quantity ?? 0) > 0);

  const inStockVariants = availableVariants.filter(isVariantInStock);
  const isAllOutOfStock = inStockVariants.length === 0;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    inStockVariants[0] || availableVariants[0] || product.product_variants?.[0]
  );
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const isSelectedInStock = isVariantInStock(selectedVariant);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedVariant || !isSelectedInStock) return;

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
    <div className="product-card group relative flex flex-col h-full bg-white rounded-none border border-gray-200 shadow-2xs hover:shadow-lg transition-all duration-300 overflow-hidden">
      
      {/* Clickable Image Poster */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square w-full max-h-40 sm:max-h-44 overflow-hidden bg-[#FAFAF5] flex items-center justify-center p-3 rounded-none block cursor-pointer"
        aria-label={`View ${product.name}`}
      >
        {/* Floating Brand Badge */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 flex flex-wrap items-center gap-1 pointer-events-none max-w-[85%]">
          {product.is_featured && (
            <span className="bg-amber-500 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-2xs">
              Bestseller
            </span>
          )}
          <span className="bg-white/95 backdrop-blur-xs text-gb-green text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-2xs border border-gray-100 flex items-center gap-1">
            <Leaf size={8} className="shrink-0" /> {isVegetables ? "Freshly Cut" : "100% Pure"}
          </span>
        </div>

        {/* Out of Stock Overlay */}
        {isAllOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none">
            <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              Out of Stock
            </span>
          </div>
        )}

        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className={cn(
              "object-contain p-2 group-hover:scale-105 transition-transform duration-300 mix-blend-multiply select-none",
              isAllOutOfStock && "opacity-60 grayscale-[40%]"
            )}
            unoptimized={product.image_url.startsWith("data:")}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
      </Link>

      {/* Info Body */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 bg-white justify-between">
        <div>
          {category && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-gb-olive mb-1 font-mono">
              {category.name}
            </p>
          )}

          {/* Clickable Product Name */}
          <Link
            href={`/products/${product.slug}`}
            className="block font-bold text-gray-900 text-xs sm:text-sm leading-snug mb-1 line-clamp-1 group-hover:text-gb-green hover:underline transition-colors"
          >
            <h3>{product.name}</h3>
          </Link>

          {product.description && (
            <p className="text-gray-500 text-[11px] sm:text-xs leading-relaxed mb-2.5 line-clamp-3">
              {product.description}
            </p>
          )}

          {/* Size / Variant Selector */}
          {availableVariants.length > 1 && (
            <div className="flex flex-wrap gap-1 mb-2.5 relative z-20" role="group" aria-label="Select package size">
              {availableVariants.map((v) => {
                const vInStock = isVariantInStock(v);
                const isSelected = v.id === selectedVariant?.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedVariant(v);
                    }}
                    className={cn(
                      "text-[10px] font-semibold py-0.5 px-2 rounded-md border transition-all cursor-pointer relative",
                      isSelected
                        ? vInStock
                          ? "bg-gb-green text-white border-gb-green shadow-2xs font-bold"
                          : "bg-gray-700 text-white border-gray-700 shadow-2xs font-bold"
                        : vInStock
                        ? "bg-gray-50 text-gray-600 border-gray-200 hover:border-gb-green"
                        : "bg-gray-100 text-gray-400 border-gray-200 line-through opacity-70"
                    )}
                    aria-pressed={isSelected}
                    title={!vInStock ? `${v.label} (Out of Stock)` : v.label}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          )}

          {availableVariants.length === 1 && (
            <div className="mb-2.5">
              <span
                className={cn(
                  "text-[10px] font-semibold py-0.5 px-1.5 rounded-md border",
                  isSelectedInStock
                    ? "bg-green-50 text-gb-green border-green-100"
                    : "bg-red-50 text-red-600 border-red-200 font-bold"
                )}
              >
                {isSelectedInStock ? `Pack: ${selectedVariant.label}` : `${selectedVariant.label} — Out of Stock`}
              </span>
            </div>
          )}
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between gap-1.5 pt-2.5 border-t border-gray-100 mt-2 relative z-20">
          <div>
            <p className="text-[9px] text-gray-400 font-semibold uppercase">Price</p>
            <span className="font-black text-gray-900 text-sm sm:text-base leading-none">
              {formatPrice(selectedVariant.price)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!isSelectedInStock}
            className={cn(
              "flex items-center justify-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs shrink-0",
              !isSelectedInStock
                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none"
                : added
                ? "bg-emerald-600 text-white cursor-pointer active:scale-95"
                : "bg-gb-green text-white hover:bg-gb-green-dark cursor-pointer active:scale-95"
            )}
            aria-label={isSelectedInStock ? `Add ${product.name} to basket` : `${product.name} is out of stock`}
            id={`add-to-cart-${product.id}-${selectedVariant.id}`}
          >
            {!isSelectedInStock ? (
              <span className="text-[10px] sm:text-[11px] font-bold text-gray-400">Out of Stock</span>
            ) : added ? (
              <>
                <Check size={12} aria-hidden="true" />
                <span className="text-[11px]">Added</span>
              </>
            ) : (
              <>
                <ShoppingCart size={12} aria-hidden="true" />
                <span className="text-[11px]">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
