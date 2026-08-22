import Link from "next/link";
import Image from "next/image";
import type { ProductWithVariants } from "@/types/database";
import { formatPrice } from "@/lib/utils";
import { getLowestPrice as getPrice } from "@/lib/supabase/queries";

function ProductCardSkeleton() {
  return (
    <div className="product-card p-0 overflow-hidden">
      <div className="skeleton aspect-square w-full" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="flex gap-2">
          <div className="skeleton h-6 w-12 rounded-full" />
          <div className="skeleton h-6 w-12 rounded-full" />
        </div>
        <div className="skeleton h-8 w-full rounded-lg mt-2" />
      </div>
    </div>
  );
}

interface FeaturedProductCardProps {
  product: ProductWithVariants;
}

function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  const availableVariants = product.product_variants.filter(
    (v) => v.is_available
  );
  const lowestPrice = getPrice(product.product_variants);
  const category = product.categories;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="product-card block group"
      aria-label={`${product.name} — from ${lowestPrice ? formatPrice(lowestPrice) : "View product"}`}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover product-image"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gb-cream-dark">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D1D5DB"
              strokeWidth="1.5"
              className="w-12 h-12"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Category label */}
        {category && (
          <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: "#718F42" }}>
            {category.name}
          </p>
        )}

        {/* Name */}
        <h3 className="font-semibold text-gb-charcoal text-sm leading-tight mb-1 group-hover:text-gb-green transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-gray-400 text-xs leading-snug mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Variants */}
        {availableVariants.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {availableVariants.slice(0, 2).map((v) => (
              <span key={v.id} className="variant-pill text-xs py-0.5 px-2">
                {v.label}
              </span>
            ))}
            {availableVariants.length > 2 && (
              <span className="text-xs text-gray-400 flex items-center">
                +{availableVariants.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Price + Add */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-gb-charcoal text-base">
            {lowestPrice ? formatPrice(lowestPrice) : "—"}
          </span>
          <span className="text-xs font-semibold text-gb-green border border-gb-green rounded-lg px-3 py-1.5 hover:bg-gb-green hover:text-white transition-colors">
            View
          </span>
        </div>
      </div>
    </Link>
  );
}

interface FeaturedProductsProps {
  products: ProductWithVariants[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section
      className="py-14 md:py-18 bg-white"
      aria-labelledby="featured-products-heading"
    >
      <div className="gb-container">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "#245B35" }}
            >
              Popular Picks
            </p>
            <h2
              id="featured-products-heading"
              className="text-2xl md:text-3xl font-bold text-gb-charcoal"
            >
              Our bestsellers.
            </h2>
          </div>
          <Link
            href="/categories"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gb-charcoal hover:text-gb-green transition-colors shrink-0"
          >
            View all
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {products.map((product) => (
            <FeaturedProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
