"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import type { ProductWithVariants, ProductVariant } from "@/types/database";
import { ShoppingCart, Check, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductDetailClientProps {
  product: ProductWithVariants;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const availableVariants = product.product_variants.filter((v) => v.is_available);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    availableVariants[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        variantId: selectedVariant.id,
        productName: product.name,
        variantLabel: selectedVariant.label,
        price: selectedVariant.price,
        imageUrl: product.image_url,
        slug: product.slug,
      });
    }

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setQuantity(1);
    }, 2000);
  };

  const category = product.categories;

  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
      {/* LEFT — Image */}
      <div>
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gb-border">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gb-cream-dark">
              <svg viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" className="w-16 h-16" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — Product info */}
      <div className="mt-8 lg:mt-0">
        {/* Category */}
        {category && (
          <Link
            href={`/categories/${category.slug}`}
            className="inline-block text-xs font-semibold uppercase tracking-wider mb-3 hover:underline"
            style={{ color: "#718F42" }}
          >
            {category.name}
          </Link>
        )}

        {/* Name */}
        <h1 className="text-3xl md:text-4xl font-bold text-gb-charcoal mb-4 leading-tight">
          {product.name}
        </h1>

        {/* Description */}
        {product.description && (
          <p className="text-gray-500 text-base leading-relaxed mb-6">
            {product.description}
          </p>
        )}

        {/* Variant selection */}
        {availableVariants.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gb-charcoal mb-3">
              Select size
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Select product variant">
              {availableVariants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={cn(
                    "flex flex-col items-center px-4 py-2.5 border-2 rounded-xl text-sm font-medium transition-all",
                    v.id === selectedVariant.id
                      ? "border-gb-green bg-green-50 text-gb-green"
                      : "border-gray-200 text-gray-600 hover:border-gb-green/50"
                  )}
                  aria-pressed={v.id === selectedVariant.id}
                  aria-label={`Select ${v.label} — ${formatPrice(v.price)}`}
                >
                  <span>{v.label}</span>
                  <span className="text-xs font-semibold mt-0.5">
                    {formatPrice(v.price)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        {selectedVariant && (
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gb-charcoal">
              {formatPrice(selectedVariant.price)}
            </span>
            {selectedVariant.compare_price && selectedVariant.compare_price > selectedVariant.price && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(selectedVariant.compare_price)}
              </span>
            )}
          </div>
        )}

        {/* Availability */}
        <div className="flex items-center gap-2 mb-6">
          {selectedVariant?.stock_quantity > 0 ? (
            <>
              <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
              <span className="text-sm text-green-700 font-medium">In stock</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-red-400" aria-hidden="true" />
              <span className="text-sm text-red-600 font-medium">Out of stock</span>
            </>
          )}
        </div>

        {/* Quantity + Add to Cart */}
        <div className="flex items-center gap-3 mb-8">
          {/* Quantity */}
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={14} className="text-gray-500" aria-hidden="true" />
            </button>
            <span
              className="w-10 text-center text-sm font-semibold text-gb-charcoal"
              aria-label={`Quantity: ${quantity}`}
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={14} className="text-gray-500" aria-hidden="true" />
            </button>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold transition-all",
              added
                ? "bg-green-600 text-white"
                : "btn-primary"
            )}
            id={`product-add-to-cart-btn`}
          >
            {added ? (
              <>
                <Check size={16} aria-hidden="true" />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingCart size={16} aria-hidden="true" />
                Add to Cart
              </>
            )}
          </button>
        </div>

        {/* Additional info sections */}
        <div className="space-y-4 border-t border-gb-border pt-6">
          {product.benefits && (
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer py-2 text-sm font-semibold text-gb-charcoal list-none">
                Benefits
                <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </summary>
              <p className="text-sm text-gray-500 leading-relaxed pt-2 pb-4">
                {product.benefits}
              </p>
            </details>
          )}

          {product.ingredients && (
            <details className="group border-t border-gb-border">
              <summary className="flex items-center justify-between cursor-pointer py-2 text-sm font-semibold text-gb-charcoal list-none">
                Ingredients
                <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </summary>
              <p className="text-sm text-gray-500 leading-relaxed pt-2 pb-4">
                {product.ingredients}
              </p>
            </details>
          )}

          {product.storage_info && (
            <details className="group border-t border-gb-border">
              <summary className="flex items-center justify-between cursor-pointer py-2 text-sm font-semibold text-gb-charcoal list-none">
                Storage
                <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </summary>
              <p className="text-sm text-gray-500 leading-relaxed pt-2 pb-4">
                {product.storage_info}
              </p>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
