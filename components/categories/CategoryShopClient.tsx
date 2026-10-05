"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCardClient } from "@/components/products/ProductCardClient";
import {
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  Clock,
  Sparkles,
} from "lucide-react";
import type { Category, ProductWithVariants } from "@/types/database";

interface CategoryShopClientProps {
  categories: Category[];
  currentCategory: Category;
  initialProducts: ProductWithVariants[];
}

export function CategoryShopClient({
  categories,
  currentCategory,
  initialProducts,
}: CategoryShopClientProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "name_asc">("featured");
  const [inStockOnly, setInStockOnly] = useState(false);

  // Defensive check: ensure only active products belonging to active category are processed
  const activeProducts = initialProducts.filter(
    (product) => product.is_active === true && (product.categories as any)?.is_active !== false
  );

  const filtered = activeProducts
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.slug.toLowerCase().includes(search.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(search.toLowerCase()));

      const hasStock = product.product_variants.some((v) => v.is_available && v.stock_quantity > 0);
      const matchesStock = !inStockOnly || hasStock;

      return matchesSearch && matchesStock;
    })
    .sort((a, b) => {
      const minPriceA =
        a.product_variants.length > 0
          ? Math.min(...a.product_variants.map((v) => v.price))
          : 0;
      const minPriceB =
        b.product_variants.length > 0
          ? Math.min(...b.product_variants.map((v) => v.price))
          : 0;

      if (sortBy === "price_asc") return minPriceA - minPriceB;
      if (sortBy === "price_desc") return minPriceB - minPriceA;
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "featured") {
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      }
      return 0;
    });

  return (
    <div className="space-y-8">
      {/* Category Pills Navigation Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Link
          href="/categories"
          className="px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors shrink-0"
        >
          All Categories
        </Link>
        {categories.map((cat) => {
          const isActive = cat.id === currentCategory.id;
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? "bg-gb-green text-white shadow-xs"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>

      {/* Clean Category Heading */}
      <div className="text-left pt-1 pb-2">
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-gb-green text-[11px] font-bold uppercase tracking-wider mb-2.5 border border-emerald-200/60 shadow-2xs">
          AUTHENTIC KERALA KITCHEN PRODUCE
        </span>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gb-charcoal tracking-tight leading-tight uppercase mb-2">
          {currentCategory.name}
        </h1>

        <p className="text-gray-500 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl">
          {currentCategory.description ||
            "Cleaned, hygienic, and delivered fresh to your doorstep every morning."}
        </p>
      </div>

      {/* Interactive Toolbar (only shown if there are active products) */}
      {activeProducts.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search in ${currentCategory.name}...`}
              className="gb-input has-icon !pl-10 text-xs py-2 bg-gray-50/60"
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>

          {/* Right filters */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 text-gb-green rounded border-gray-300"
              />
              <span>In Stock Only</span>
            </label>

            <div className="relative flex items-center">
              <ArrowUpDown size={13} className="absolute left-3 text-gray-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="gb-input has-icon !pl-9 pr-8 text-xs py-2 bg-gray-50/60 font-semibold"
                style={{ paddingLeft: "2.35rem" }}
              >
                <option value="featured">Featured First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid / Empty States */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5">
          {filtered.map((product) => (
            <ProductCardClient key={product.id} product={product} />
          ))}
        </div>
      ) : activeProducts.length === 0 ? (
        /* Empty State: Sold Out for Today, Available Tomorrow */
        <div className="text-center py-16 px-6 bg-white rounded-3xl border border-gray-200/80 shadow-sm max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
            <Clock size={28} />
          </div>
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100/70 text-amber-800 text-[11px] font-extrabold uppercase tracking-wide mb-2">
              Today Sold Out
            </span>
            <h3 className="text-xl font-black text-gray-900 mb-1.5">Fresh Batch Available Tomorrow</h3>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
              Our daily batch for this category is currently sold out. Freshly harvested stock arrives tomorrow morning!
            </p>
          </div>
          <div className="pt-2">
            <Link href="/categories" className="btn-primary text-xs px-6 py-3 font-extrabold uppercase tracking-wider inline-flex items-center gap-2">
              <Sparkles size={14} /> Explore Other Categories
            </Link>
          </div>
        </div>
      ) : (
        /* Filter Empty State */
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200/80 p-8 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-gb-green flex items-center justify-center mx-auto mb-4">
            <SlidersHorizontal size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No products match your criteria</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
            Try adjusting your search terms or filter selections.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setInStockOnly(false);
              setSortBy("featured");
            }}
            className="btn-primary text-xs px-5 py-2.5"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
