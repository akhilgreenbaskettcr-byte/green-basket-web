"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ProductCardClient } from "@/components/products/ProductCardClient";
import type { ProductWithVariants, Category } from "@/types/database";
import {
  SlidersHorizontal,
  Search,
  X,
  Sparkles,
  ArrowUpDown,
  ShoppingBag,
  Check,
  ChevronDown,
  RotateCcw,
} from "lucide-react";

interface ShopAllClientProps {
  initialProducts: ProductWithVariants[];
  categories: Category[];
}

type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";

export function ShopAllClient({
  initialProducts,
  categories,
}: ShopAllClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<SortOption>("featured");
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Lock body scroll when mobile bottom sheet is open
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileFilterOpen]);

  // Active filters count for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedSort !== "featured") count++;
    if (onlyFeatured) count++;
    if (onlyInStock) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedCategory, selectedSort, onlyFeatured, onlyInStock, searchQuery]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.categories?.name?.toLowerCase().includes(q) ||
          p.product_variants?.some((v) => v.label.toLowerCase().includes(q))
      );
    }

    // 2. Category Filter
    if (selectedCategory !== "all") {
      list = list.filter(
        (p) => p.category_id === selectedCategory || p.categories?.slug === selectedCategory
      );
    }

    // 3. Bestsellers Only
    if (onlyFeatured) {
      list = list.filter((p) => p.is_featured);
    }

    // 4. In-Stock Only
    if (onlyInStock) {
      list = list.filter((p) =>
        p.product_variants?.some((v) => v.is_available && (v.stock_quantity ?? 1) > 0)
      );
    }

    // 5. Sorting
    switch (selectedSort) {
      case "price-asc":
        list.sort((a, b) => {
          const priceA = a.product_variants?.[0]?.price ?? 0;
          const priceB = b.product_variants?.[0]?.price ?? 0;
          return priceA - priceB;
        });
        break;
      case "price-desc":
        list.sort((a, b) => {
          const priceA = a.product_variants?.[0]?.price ?? 0;
          const priceB = b.product_variants?.[0]?.price ?? 0;
          return priceB - priceA;
        });
        break;
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "featured":
      default:
        list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        break;
    }

    return list;
  }, [initialProducts, searchQuery, selectedCategory, selectedSort, onlyFeatured, onlyInStock]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedSort("featured");
    setOnlyFeatured(false);
    setOnlyInStock(false);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* ── Top Bar: Search, Category Chips & Controls ── */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-4 sm:p-6 shadow-xs space-y-4">
        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vegetables, powders, oils…"
              className="gb-input has-icon !pl-11 pr-10 py-2.5 text-xs sm:text-sm rounded-2xl"
              style={{ paddingLeft: "2.75rem" }}
            />
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Controls: Desktop Sort & Mobile Filter CTA */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Desktop Sort Dropdown */}
            <div className="hidden sm:flex items-center gap-2 bg-[#FAFAF5] px-3 py-2 rounded-2xl border border-gray-200/80 text-xs">
              <ArrowUpDown size={14} className="text-gray-400" />
              <span className="text-gray-500 font-medium">Sort:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as SortOption)}
                className="bg-transparent font-bold text-gb-charcoal cursor-pointer focus:outline-none"
              >
                <option value="featured">Featured / Best</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>

            {/* Mobile Filter Trigger Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="sm:hidden flex-1 flex items-center justify-center gap-2 bg-[#FAFAF5] hover:bg-gray-100 text-gb-charcoal border border-gray-200 py-2.5 px-4 rounded-2xl text-xs font-bold transition-all"
            >
              <SlidersHorizontal size={15} className="text-gb-green" />
              <span>Filters & Sort</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-gb-green text-white text-[10px] font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Active filters reset */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 px-3 py-2 rounded-2xl border border-red-100 transition-colors"
                title="Clear all filters"
              >
                <RotateCcw size={13} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Desktop Category Pills Row */}
        <div className="pt-2 border-t border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === "all"
                ? "bg-gb-green text-white shadow-xs"
                : "bg-[#FAFAF5] text-gray-600 hover:bg-gray-100 border border-gray-200/80"
            }`}
          >
            All Items ({initialProducts.length})
          </button>

          {categories.map((cat) => {
            const count = initialProducts.filter((p) => p.category_id === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? "all" : cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? "bg-gb-green text-white shadow-xs"
                    : "bg-[#FAFAF5] text-gray-600 hover:bg-gray-100 border border-gray-200/80"
                }`}
              >
                {cat.name} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Product Results Header ── */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <p>
          Showing <strong className="text-gb-charcoal">{filteredProducts.length}</strong> of{" "}
          <strong className="text-gb-charcoal">{initialProducts.length}</strong> products
        </p>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="sm:hidden text-red-600 font-bold hover:underline"
          >
            Clear Filters ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* ── Product Grid ── */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCardClient key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-gb-green">
            <ShoppingBag size={28} className="text-gray-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gb-charcoal">No Products Found</h3>
            <p className="text-xs text-gray-500 mt-1">
              We couldn&apos;t find anything matching your filters or search query.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="btn-primary py-2.5 px-5 text-xs font-bold inline-flex gap-1.5"
          >
            <RotateCcw size={14} /> Clear All Filters
          </button>
        </div>
      )}

      {/* ── Mobile Bottom Sheet Drawer Filter Modal ── */}
      {isMobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:hidden bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl border-t border-gray-200 p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pull Handle & Header */}
            <div>
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-gb-charcoal">Filter & Sort</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Customize your grocery view</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Sort By
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "featured", label: "Featured / Best" },
                  { value: "price-asc", label: "Price: Low to High" },
                  { value: "price-desc", label: "Price: High to Low" },
                  { value: "name-asc", label: "Name: A to Z" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedSort(opt.value as SortOption)}
                    className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between ${
                      selectedSort === opt.value
                        ? "bg-emerald-50 border-gb-green text-gb-green"
                        : "bg-[#FAFAF5] border-gray-200/80 text-gray-700"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedSort === opt.value && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedCategory === "all"
                      ? "bg-gb-green border-gb-green text-white"
                      : "bg-[#FAFAF5] border-gray-200/80 text-gray-700"
                  }`}
                >
                  All Categories ({initialProducts.length})
                </button>
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const count = initialProducts.filter((p) => p.category_id === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(isSelected ? "all" : cat.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? "bg-gb-green border-gb-green text-white"
                          : "bg-[#FAFAF5] border-gray-200/80 text-gray-700"
                      }`}
                    >
                      {cat.name} {count > 0 && `(${count})`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Filter Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Preferences
              </label>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-2xl bg-[#FAFAF5] border border-gray-200/80 cursor-pointer">
                  <span className="text-xs font-bold text-gb-charcoal flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-500" /> Bestsellers Only
                  </span>
                  <input
                    type="checkbox"
                    checked={onlyFeatured}
                    onChange={(e) => setOnlyFeatured(e.target.checked)}
                    className="accent-gb-green w-4 h-4 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-[#FAFAF5] border border-gray-200/80 cursor-pointer">
                  <span className="text-xs font-bold text-gb-charcoal flex items-center gap-2">
                    <ShoppingBag size={14} className="text-gb-green" /> In-Stock Items Only
                  </span>
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="accent-gb-green w-4 h-4 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Actions: Reset & Apply Button */}
            <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="py-3 px-4 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 btn-primary py-3.5 px-6 rounded-2xl text-xs font-extrabold uppercase tracking-wider justify-center"
              >
                Show {filteredProducts.length} Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
