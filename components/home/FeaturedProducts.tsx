import Link from "next/link";
import type { ProductWithVariants } from "@/types/database";
import { ProductCardClient } from "@/components/products/ProductCardClient";

interface FeaturedProductsProps {
  products: ProductWithVariants[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section
      className="py-12 md:py-16 bg-white"
      aria-labelledby="featured-products-heading"
    >
      <div className="gb-container">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-1.5"
              style={{ color: "#245B35" }}
            >
              POPULAR PICKS
            </p>
            <h2
              id="featured-products-heading"
              className="text-2xl md:text-3xl font-extrabold text-gb-charcoal uppercase tracking-tight"
            >
              OUR BESTSELLERS.
            </h2>
          </div>
          <Link
            href="/categories"
            className="hidden sm:flex items-center gap-2 text-xs sm:text-sm font-bold text-gb-charcoal hover:text-gb-green transition-colors shrink-0 uppercase tracking-wide"
          >
            VIEW ALL
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5">
          {products.map((product) => (
            <ProductCardClient key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
