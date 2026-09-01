"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  X,
  ArrowRight,
  Package,
  History,
  Clock,
  Loader2,
  Tag,
  Plus,
  Check,
  ChevronRight,
  Leaf,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { searchProductsLiveAction } from "@/app/actions/products";

interface ProductVariant {
  id: string;
  label: string;
  price: number;
  stock_quantity: number;
  is_available: boolean;
}

interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
}

interface LiveProductResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  categories?: CategoryInfo | null;
  product_variants?: ProductVariant[];
}

const RECENT_SEARCHES_KEY = "gb_recent_searches";
const MAX_RECENT_SEARCHES = 5;

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dbCategories, setDbCategories] = useState<CategoryInfo[]>([]);
  const [results, setResults] = useState<LiveProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const addItemToCart = useCartStore((state) => state.addItem);

  // Load recent searches & active categories on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage errors
    }

    async function loadCategories() {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
          .from("categories")
          .select("id, name, slug")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (data && data.length > 0) {
          setDbCategories(data as CategoryInfo[]);
        }
      } catch (err) {
        console.error("Error loading categories for search:", err);
      }
    }
    loadCategories();
  }, []);

  const saveRecentSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(
        0,
        MAX_RECENT_SEARCHES
      );
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const removeRecentSearch = (searchTerm: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== searchTerm);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore
    }
  };

  // Keyboard shortcut listener ('/' key opens search if not typing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll when modal is active & auto focus input
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
      setSelectedIndex(-1);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Live Autocomplete search fetch via Server Action
  const fetchLiveResults = useCallback(async (searchTerm: string, categorySlug: string) => {
    const term = searchTerm.trim();
    if (!term || term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await searchProductsLiveAction(term, categorySlug);
      setResults((data as LiveProductResult[]) || []);
      setSelectedIndex(-1);
    } catch (err) {
      console.error("Live search exception:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced live search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        fetchLiveResults(query, categoryFilter);
      } else {
        setResults([]);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query, categoryFilter, fetchLiveResults]);

  const executeSearch = (searchTerm: string) => {
    const q = searchTerm.trim();
    if (!q) return;
    saveRecentSearch(q);
    router.push(`/categories/${categoryFilter !== "all" ? categoryFilter : ""}?q=${encodeURIComponent(q)}`);
    setOpen(false);
    setQuery("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && results[selectedIndex]) {
      const product = results[selectedIndex];
      saveRecentSearch(product.name);
      router.push(`/products/${product.slug}`);
      setOpen(false);
      setQuery("");
    } else {
      executeSearch(query);
    }
  };

  const handleQuickTagClick = (tag: string) => {
    setQuery(tag);
    executeSearch(tag);
  };

  const handleClose = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setSelectedIndex(-1);
  };

  // Keyboard navigation within search results
  const handleKeyDownInModal = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
      return;
    }

    if (results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: LiveProductResult) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.product_variants?.[0];
    if (!variant) return;

    addItemToCart({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      variantLabel: variant.label || "Standard",
      price: variant.price,
      imageUrl: product.image_url || "",
      slug: product.slug,
    });

    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  // Highlight matching text helper
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-emerald-100 text-gb-green font-bold px-0.5 rounded">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <>
      {/* Desktop Search Bar Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center bg-gray-50/90 hover:bg-white border border-gray-200/90 hover:border-gb-green/40 rounded-full pl-3.5 pr-2 py-1.5 w-64 lg:w-80 transition-all duration-200 shadow-2xs hover:shadow-sm group text-left cursor-pointer"
        aria-label="Search fresh groceries"
      >
        <Search size={16} className="text-gray-400 group-hover:text-gb-green transition-colors shrink-0 mr-2.5" />
        <span className="w-full text-xs font-medium text-gray-500 truncate group-hover:text-gray-700">
          Search fresh vegetables, fruits...
        </span>
        <div className="flex items-center shrink-0 ml-auto pl-2">
          <span className="bg-gb-green hover:bg-gb-green-dark text-white text-[11px] font-bold px-3 py-1.5 rounded-full transition-all shadow-xs shrink-0">
            Search
          </span>
        </div>
      </button>

      {/* Mobile Search Trigger Icon */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-gray-100/90 hover:bg-gb-green hover:text-white transition-colors cursor-pointer text-gb-charcoal"
        aria-label="Open search modal"
      >
        <Search size={18} />
      </button>

      {/* Fresh Minimal Search Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-6 sm:pt-16 md:pt-20 px-3 sm:px-4"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label="Search Modal"
          onKeyDown={handleKeyDownInModal}
        >
          {/* Backdrop Overlay */}
          <div className="absolute inset-0 bg-black/45 backdrop-blur-md transition-opacity animate-in fade-in duration-200" />

          {/* Search Window */}
          <div
            className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Search Input Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center border-b border-gray-100 px-4 sm:px-6 py-1 bg-white"
            >
              {loading ? (
                <Loader2 size={20} className="text-gb-green animate-spin shrink-0 mr-3" />
              ) : (
                <Search size={20} className="text-gb-green shrink-0 mr-3" />
              )}

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fresh vegetables, fruits, powders..."
                className="w-full text-base sm:text-lg font-medium text-gb-charcoal placeholder-gray-400 bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 py-3.5 sm:py-4"
                style={{ outline: "none", boxShadow: "none" }}
                aria-label="Search fresh groceries"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                    inputRef.current?.focus();
                  }}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0 mr-2 cursor-pointer"
                  aria-label="Clear search input"
                >
                  <X size={16} />
                </button>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0 cursor-pointer"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </form>

            {/* Quick Category Filter Pills */}
            <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-gray-50/70 border-b border-gray-100 overflow-x-auto no-scrollbar text-xs">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  categoryFilter === "all"
                    ? "bg-gb-green text-white shadow-xs"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                All Products
              </button>

              {dbCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.slug)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    categoryFilter === cat.slug
                      ? "bg-gb-green text-white shadow-xs"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
              {query.trim().length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs font-semibold text-gray-400">
                    <span>
                      {loading
                        ? "Searching products..."
                        : `Found ${results.length} matching product${results.length === 1 ? "" : "s"}`}
                    </span>
                  </div>

                  {results.length > 0 ? (
                    <div className="space-y-1.5">
                      {results.map((product, idx) => {
                        const variant = product.product_variants?.[0];
                        const isSelected = selectedIndex === idx;
                        const isAdded = addedItemIds[product.id];

                        return (
                          <div
                            key={product.id}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            onClick={() => {
                              saveRecentSearch(product.name);
                              router.push(`/products/${product.slug}`);
                              handleClose();
                            }}
                            className={`group flex items-center gap-3.5 p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer border ${
                              isSelected
                                ? "bg-green-50/80 border-green-200 shadow-2xs border-l-4 border-l-gb-green"
                                : "bg-white hover:bg-gray-50/80 border-transparent hover:border-gray-100"
                            }`}
                          >
                            {/* Product Thumbnail */}
                            <div className="relative w-12 h-12 rounded-lg bg-gray-50 border border-gray-200/70 overflow-hidden shrink-0 flex items-center justify-center">
                              {product.image_url ? (
                                <Image
                                  src={product.image_url}
                                  alt={product.name}
                                  fill
                                  sizes="48px"
                                  className="object-contain p-1 mix-blend-multiply transition-transform group-hover:scale-105"
                                  unoptimized={product.image_url.startsWith("data:")}
                                />
                              ) : (
                                <Package size={22} className="text-gray-300" />
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gb-charcoal group-hover:text-gb-green transition-colors truncate">
                                {renderHighlightedText(product.name, query)}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                {product.categories && (
                                  <span className="text-[10px] font-bold text-gb-olive uppercase tracking-wider font-mono bg-gb-olive/10 px-1.5 py-0.5 rounded">
                                    {product.categories.name}
                                  </span>
                                )}
                                {variant?.label && (
                                  <span className="text-xs text-gray-500 font-medium">
                                    {variant.label}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Price & Action */}
                            <div className="flex items-center gap-3 shrink-0">
                              {variant && (
                                <div className="text-right">
                                  <span className="text-sm font-bold text-gb-charcoal block">
                                    {formatPrice(variant.price)}
                                  </span>
                                  {variant.is_available && variant.stock_quantity > 0 ? (
                                    <span className="text-[10px] text-emerald-600 font-semibold">
                                      In Stock
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-rose-500 font-semibold">
                                      Out of Stock
                                    </span>
                                  )}
                                </div>
                              )}

                              {variant?.is_available && (
                                <button
                                  type="button"
                                  onClick={(e) => handleAddToCart(e, product)}
                                  className={`p-2 rounded-lg transition-all text-xs font-bold flex items-center justify-center ${
                                    isAdded
                                      ? "bg-emerald-600 text-white"
                                      : "bg-gray-100 hover:bg-gb-green hover:text-white text-gray-700"
                                  }`}
                                  title="Add to cart"
                                >
                                  {isAdded ? <Check size={15} /> : <Plus size={15} />}
                                </button>
                              )}

                              <ChevronRight
                                size={16}
                                className={`text-gray-300 transition-transform ${
                                  isSelected ? "text-gb-green translate-x-0.5" : "group-hover:text-gray-500"
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => executeSearch(query)}
                        className="w-full text-center py-2.5 mt-3 rounded-xl bg-gb-green/10 hover:bg-gb-green hover:text-white text-gb-green text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer group"
                      >
                        <span>View all results for &quot;{query}&quot;</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  ) : !loading ? (
                    <div className="py-10 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                        <Search size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gb-charcoal">
                          No groceries found for &quot;{query}&quot;
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Try searching for Vegetables, Powders, or Oils.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Loading skeleton placeholder */
                    <div className="space-y-2 py-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3.5 p-3 rounded-xl bg-gray-50/50">
                          <div className="w-12 h-12 rounded-lg bg-gray-200 animate-pulse shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="w-1/2 h-4 bg-gray-200 animate-pulse rounded" />
                            <div className="w-1/4 h-3 bg-gray-200 animate-pulse rounded" />
                          </div>
                          <div className="w-16 h-4 bg-gray-200 animate-pulse rounded" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Default Minimal View: Recent Searches + Quick Browse */
                <div className="space-y-6">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                          <Clock size={13} className="text-gray-400" />
                          <span>Recent Searches</span>
                        </div>
                        <button
                          type="button"
                          onClick={clearAllRecentSearches}
                          className="text-[11px] font-semibold text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          Clear history
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term) => (
                          <div
                            key={term}
                            onClick={() => handleQuickTagClick(term)}
                            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100/80 hover:bg-emerald-50 hover:text-gb-green text-gray-700 text-xs font-medium transition-all cursor-pointer border border-gray-200/60"
                          >
                            <History size={12} className="text-gray-400 group-hover:text-gb-green" />
                            <span>{term}</span>
                            <button
                              type="button"
                              onClick={(e) => removeRecentSearch(term, e)}
                              className="p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors ml-0.5"
                              aria-label={`Remove ${term}`}
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Store Highlights */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-3">
                      <Tag size={13} className="text-gb-green" />
                      <span>Quick Browse</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/categories"
                        onClick={handleClose}
                        className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200/80 bg-gray-50/60 hover:bg-emerald-50/60 hover:border-emerald-200 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-gb-green flex items-center justify-center shrink-0 border border-emerald-200/60 group-hover:bg-gb-green group-hover:text-white transition-colors">
                          <Leaf size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gb-charcoal group-hover:text-gb-green transition-colors truncate">
                            Fresh Produce
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">Cleaned & ready to cook</p>
                        </div>
                      </Link>

                      <Link
                        href="/categories"
                        onClick={handleClose}
                        className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200/80 bg-gray-50/60 hover:bg-emerald-50/60 hover:border-emerald-200 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-gb-green flex items-center justify-center shrink-0 border border-emerald-200/60 group-hover:bg-gb-green group-hover:text-white transition-colors">
                          <Sparkles size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gb-charcoal group-hover:text-gb-green transition-colors truncate">
                            Kerala Essentials
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">Spices, Oils & Powders</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Clean Minimal Footer */}
            <div className="bg-gray-50/80 border-t border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-end text-[11px]">
              <Link
                href="/categories"
                onClick={handleClose}
                className="text-gb-green hover:underline font-bold flex items-center gap-1"
              >
                <span>Browse All Categories</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
