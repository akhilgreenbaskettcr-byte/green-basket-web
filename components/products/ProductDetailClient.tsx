"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import type { ProductWithVariants, ProductVariant } from "@/types/database";
import {
  ShoppingCart,
  Check,
  Minus,
  Plus,
  Leaf,
  ShieldCheck,
  Truck,
  Sparkles,
  ChevronDown,
  Info,
  Package,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductDetailClientProps {
  product: ProductWithVariants;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const availableVariants = product.product_variants.filter((v) => v.is_available);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    availableVariants[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const addItemSilent = useCartStore((s) => s.addItemSilent);
  const closeCart = useCartStore((s) => s.closeCart);

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addItem(
      {
        productId: product.id,
        variantId: selectedVariant.id,
        productName: product.name,
        variantLabel: selectedVariant.label,
        price: selectedVariant.price,
        imageUrl: product.image_url,
        slug: product.slug,
      },
      quantity
    );

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setQuantity(1);
    }, 2000);
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return;

    // Use silent add — keeps cart drawer closed (cart drawer sets isOpen:true on normal addItem)
    closeCart();
    addItemSilent(
      {
        productId: product.id,
        variantId: selectedVariant.id,
        productName: product.name,
        variantLabel: selectedVariant.label,
        price: selectedVariant.price,
        imageUrl: product.image_url,
        slug: product.slug,
      },
      quantity
    );

    router.push("/checkout");
  };

  const category = product.categories;
  const isVegetable =
    product.slug.includes("cut") ||
    product.slug.includes("coconut") ||
    product.slug.includes("vegetable");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-14 xl:gap-18 items-start">
      {/* LEFT — Product Visual Stage */}
      <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-4">
        <div className="relative aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-gray-200/70 shadow-2xs group p-4 sm:p-10 flex items-center justify-center">
          {/* Floating Badges */}
          <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-10 flex items-center justify-between gap-2 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full text-[11px] sm:text-xs font-bold text-gb-green shadow-2xs border border-gray-100/80">
              <Leaf size={12} className="text-gb-green shrink-0" />
              {isVegetable ? "Farm Fresh" : "100% Organic & Pure"}
            </span>
            {product.is_featured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-wider shadow-xs">
                <Sparkles size={11} /> Bestseller
              </span>
            )}
          </div>

          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-4 sm:p-10 group-hover:scale-105 transition-transform duration-500 ease-out select-none mix-blend-multiply"
              priority
              unoptimized={product.image_url.startsWith("data:")}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gb-cream-dark/30">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D1D5DB"
                strokeWidth="1.5"
                className="w-16 h-16 sm:w-20 sm:h-20"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — Editorial Product Information & Flow */}
      <div className="lg:col-span-6 xl:col-span-6 flex flex-col pt-1 sm:pt-2">
        {/* Category Tag & Stock Status (Positioned immediately below image on mobile) */}
        <div className="flex items-center justify-between gap-3 mb-2 sm:mb-3">
          {category ? (
            <Link
              href={`/categories/${category.slug}`}
              className="text-xs font-extrabold uppercase tracking-widest text-gb-olive hover:text-gb-green transition-colors font-mono"
            >
              {category.name}
            </Link>
          ) : (
            <div />
          )}

          {/* Stock Indicator */}
          <div>
            {selectedVariant?.stock_quantity > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                In Stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Product Title (Moderately sized & clean on desktop, unchanged on mobile) */}
        <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-black text-gb-charcoal tracking-tight leading-tight mb-3 sm:mb-4">
          {product.name}
        </h1>

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-5 sm:mb-6 font-normal max-w-xl">
            {product.description}
          </p>
        )}

        {/* Size / Variant Selector */}
        {availableVariants.length > 0 && (
          <div className="mb-5 sm:mb-6">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 font-mono mb-2.5">
              Select Size
            </label>

            <div
              className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5"
              role="group"
              aria-label="Select product variant"
            >
              {availableVariants.map((v) => {
                const isSelected = v.id === selectedVariant?.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-xl border transition-all cursor-pointer text-left",
                      isSelected
                        ? "border-gb-green bg-green-50/50 text-gb-green font-bold shadow-2xs ring-1 ring-gb-green/20"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    )}
                    aria-pressed={isSelected}
                    aria-label={`Select ${v.label} — ${formatPrice(v.price)}`}
                  >
                    <span className="text-xs font-bold truncate pr-1">{v.label}</span>
                    <span className="text-xs font-extrabold shrink-0">
                      {formatPrice(v.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price Presentation (Balanced desktop price size, unchanged on mobile) */}
        {selectedVariant && (
          <div className="flex items-baseline gap-3 my-4 sm:my-6">
            <span className="text-3xl sm:text-3xl lg:text-4xl font-black text-gb-charcoal tracking-tight font-sans">
              {formatPrice(selectedVariant.price)}
            </span>
            {selectedVariant.compare_price &&
              selectedVariant.compare_price > selectedVariant.price && (
                <>
                  <span className="text-base sm:text-lg text-gray-400 line-through font-medium">
                    {formatPrice(selectedVariant.compare_price)}
                  </span>
                  <span className="text-[11px] sm:text-xs font-extrabold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
                    Save {formatPrice(selectedVariant.compare_price - selectedVariant.price)}
                  </span>
                </>
              )}
          </div>
        )}

        {/* Purchase Controls — Desktop Equal Width & Perfect Alignment (Mobile 100% Untouched) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 mb-6 sm:mb-8">
          {/* Mobile Row 1: Stepper + Add to Cart (On Desktop sm:contents makes buttons equal flex-1 children) */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 max-sm:w-full sm:contents">
            {/* Stepper */}
            <div className="flex items-center justify-between border border-gray-300/80 bg-white rounded-xl h-12 px-1.5 sm:px-2 shrink-0 w-[105px] sm:w-[120px]">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 active:scale-95 transition-all text-gray-600 cursor-pointer shrink-0"
                aria-label="Decrease quantity"
              >
                <Minus size={14} className="stroke-[2.5]" />
              </button>
              <span
                className="text-sm sm:text-base font-extrabold text-gb-charcoal px-1 font-mono"
                aria-label={`Quantity: ${quantity}`}
                aria-live="polite"
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 active:scale-95 transition-all text-gray-600 cursor-pointer shrink-0"
                aria-label="Increase quantity"
              >
                <Plus size={14} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Add to Cart CTA */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
              id="product-add-to-cart-btn"
              className={cn(
                "flex-1 sm:flex-1 h-12 flex items-center justify-center gap-2 rounded-xl text-sm sm:text-base font-extrabold transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-[0.99] px-3 sm:px-4 border border-gb-green/20",
                added
                  ? "bg-emerald-600 text-white"
                  : "bg-green-50 hover:bg-green-100 text-gb-green"
              )}
            >
              {added ? (
                <>
                  <Check size={17} className="stroke-[3] shrink-0" aria-hidden="true" />
                  <span>Added to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={17} className="stroke-[2.5] shrink-0" aria-hidden="true" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>

          {/* Buy Now CTA — Full-width on mobile, 50% equal width on desktop */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
            id="product-buy-now-btn"
            className="w-full sm:flex-1 h-12 flex items-center justify-center gap-2 rounded-xl text-sm sm:text-base font-extrabold bg-gb-green hover:bg-gb-green-dark text-white transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-[0.99] px-4 shrink-0"
          >
            <Zap size={17} className="stroke-[2.5] shrink-0 fill-amber-300 text-amber-300" aria-hidden="true" />
            <span>Buy Now</span>
          </button>
        </div>

        {/* Quality Highlights Bar */}
        <div className="flex items-center justify-evenly py-3 px-2 sm:px-4 border-y border-gray-200/60 text-[11px] sm:text-xs font-semibold text-gray-600 mb-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-gb-green shrink-0" />
            <span>Hygienic Pack</span>
          </div>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-1.5">
            <Leaf size={15} className="text-gb-green shrink-0" />
            <span>100% Fresh</span>
          </div>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-1.5">
            <Truck size={15} className="text-gb-green shrink-0" />
            <span>Fast Delivery</span>
          </div>
        </div>

        {/* Editorial Product Specifications Accordions */}
        <div className="space-y-1">
          {product.benefits && (
            <details className="group border-b border-gray-200/80 py-3 sm:py-3.5 transition-colors">
              <summary className="flex items-center justify-between cursor-pointer text-xs sm:text-sm font-bold text-gb-charcoal list-none select-none">
                <span className="flex items-center gap-2.5">
                  <Sparkles size={15} className="text-gb-green" />
                  Benefits & Uses
                </span>
                <ChevronDown
                  size={15}
                  className="text-gray-400 group-open:rotate-180 transition-transform"
                />
              </summary>
              <div className="pt-2.5 pb-1 text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                {product.benefits}
              </div>
            </details>
          )}

          {product.ingredients && (
            <details className="group border-b border-gray-200/80 py-3 sm:py-3.5 transition-colors">
              <summary className="flex items-center justify-between cursor-pointer text-xs sm:text-sm font-bold text-gb-charcoal list-none select-none">
                <span className="flex items-center gap-2.5">
                  <Info size={15} className="text-gb-green" />
                  Ingredients / Origin
                </span>
                <ChevronDown
                  size={15}
                  className="text-gray-400 group-open:rotate-180 transition-transform"
                />
              </summary>
              <div className="pt-2.5 pb-1 text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                {product.ingredients}
              </div>
            </details>
          )}

          {product.storage_info && (
            <details className="group border-b border-gray-200/80 py-3 sm:py-3.5 transition-colors">
              <summary className="flex items-center justify-between cursor-pointer text-xs sm:text-sm font-bold text-gb-charcoal list-none select-none">
                <span className="flex items-center gap-2.5">
                  <Package size={15} className="text-gb-green" />
                  Storage & Shelf Life
                </span>
                <ChevronDown
                  size={15}
                  className="text-gray-400 group-open:rotate-180 transition-transform"
                />
              </summary>
              <div className="pt-2.5 pb-1 text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                {product.storage_info}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}


