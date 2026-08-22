"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCardClient } from "@/components/products/ProductCardClient";
import {
  Search,
  ArrowUpDown,
  Sparkles,
  ShieldCheck,
  Truck,
  Leaf,
  SlidersHorizontal,
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

  const filtered = initialProducts
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

      {/* Editorial Commercial Ad Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#245B35] via-[#1a4427] to-[#12311b] text-white p-6 sm:p-8 md:p-10 shadow-sm border border-emerald-800/30">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-lime-300 text-[11px] font-bold tracking-wider uppercase">
            <Sparkles size={12} /> Authentic Kerala Kitchen Produce
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            {currentCategory.name}
          </h2>
          <p className="text-white/80 text-xs sm:text-sm md:text-base leading-relaxed">
            {currentCategory.description ||
              "Cleaned, hygienic, and delivered fresh to your doorstep every morning."}
          </p>

          <div className="flex flex-wrap gap-4 pt-2 text-[11px] font-semibold text-emerald-100/90">
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
              <Leaf size={13} className="text-lime-400" /> 100% Zero Additives
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
              <ShieldCheck size={13} className="text-lime-400" /> Hygienic Food Grade Pack
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
              <Truck size={13} className="text-lime-400" /> Same-Day Dispatch
            </span>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-linear-to-l from-white/10 to-transparent pointer-events-none rounded-r-3xl" />
      </div>

      {/* Interactive Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search in ${currentCategory.name}...`}
            className="gb-input pl-9 text-xs py-2 bg-gray-50/60"
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
              className="gb-input pl-8 pr-8 text-xs py-2 bg-gray-50/60 font-semibold"
            >
              <option value="featured">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((product) => (
            <ProductCardClient key={product.id} product={product} />
          ))}
        </div>
      ) : (
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
