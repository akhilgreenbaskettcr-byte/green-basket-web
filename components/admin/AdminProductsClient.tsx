"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import {
  Search,
  Plus,
  ExternalLink,
  Edit3,
  Image as ImageIcon,
  Package,
  CheckCircle2,
  AlertTriangle,
  Hash,
  Star,
  Layers,
  ArrowUpDown,
  Filter,
  Check,
  XCircle,
  Trash2,
} from "lucide-react";
import type { Product, ProductVariant, Category } from "@/types/database";

export type AdminProduct = Product & {
  categories: Pick<Category, "name"> | null;
  product_variants: ProductVariant[];
};

interface AdminProductsClientProps {
  products: AdminProduct[];
}

export function AdminProductsClient({ products: initialProducts }: AdminProductsClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "featured">("all");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "stock_asc" | "name_asc">("newest");
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const categories = Array.from(
    new Set(products.map((p) => p.categories?.name).filter(Boolean))
  ) as string[];

  // KPI Calculations
  const totalProducts = products.length;
  const activeCount = products.filter((p) => p.is_active).length;
  const featuredCount = products.filter((p) => p.is_featured).length;
  const lowStockCount = products.filter((p) => {
    const totalStock = p.product_variants.reduce((sum, v) => sum + v.stock_quantity, 0);
    return totalStock > 0 && totalStock < 15;
  }).length;

  // Toggle Active Status directly in Table
  const handleToggleActive = (productId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("products")
        .update({ is_active: !currentStatus })
        .eq("id", productId);

      if (!error) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, is_active: !currentStatus } : p))
        );
        showToast(`Product set to ${!currentStatus ? "Active" : "Draft"}`);
      }
    });
  };

  // Toggle Featured Status directly in Table
  const handleToggleFeatured = (productId: string, currentFeatured: boolean) => {
    startTransition(async () => {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("products")
        .update({ is_featured: !currentFeatured })
        .eq("id", productId);

      if (!error) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, is_featured: !currentFeatured } : p))
        );
        showToast(`Product ${!currentFeatured ? "added to" : "removed from"} Featured`);
      }
    });
  };

  // Delete Product
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) {
        alert("Failed to delete product: " + error.message);
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        showToast(`Product "${productName}" deleted`);
      }
    });
  };

  // Advanced Filtering & Sorting
  const filtered = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.slug.toLowerCase().includes(search.toLowerCase()) ||
        product.id.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || product.categories?.name === categoryFilter;

      const totalStock = product.product_variants.reduce((sum, v) => sum + v.stock_quantity, 0);
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in_stock" && totalStock > 0) ||
        (stockFilter === "low_stock" && totalStock > 0 && totalStock < 15) ||
        (stockFilter === "out_of_stock" && totalStock === 0);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.is_active) ||
        (statusFilter === "draft" && !product.is_active) ||
        (statusFilter === "featured" && product.is_featured);

      return matchesSearch && matchesCategory && matchesStock && matchesStatus;
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
      const stockA = a.product_variants.reduce((sum, v) => sum + v.stock_quantity, 0);
      const stockB = b.product_variants.reduce((sum, v) => sum + v.stock_quantity, 0);

      if (sortBy === "price_asc") return minPriceA - minPriceB;
      if (sortBy === "price_desc") return minPriceB - minPriceA;
      if (sortBy === "stock_asc") return stockA - stockB;
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gb-charcoal text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-white/10 animate-fade-in">
          <Check size={16} className="text-lime-400" />
          {toastMessage}
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Package className="text-gb-green" size={26} />
            Products Catalogue
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time stock management, pricing control, and catalogue visibility
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="btn-primary text-xs flex items-center gap-2 px-5 py-2.5 shadow-sm"
          >
            <Plus size={16} /> Add New Product
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-gb-green flex items-center justify-center shrink-0">
            <Package size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Products</p>
            <p className="text-lg font-bold text-gray-900">{totalProducts}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Active in Store</p>
            <p className="text-lg font-bold text-emerald-700">{activeCount} / {totalProducts}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Low Stock (&lt;15)</p>
            <p className="text-lg font-bold text-amber-700">{lowStockCount} items</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-700 flex items-center justify-center shrink-0">
            <Star size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Featured Items</p>
            <p className="text-lg font-bold text-yellow-700">{featuredCount}</p>
          </div>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-xs space-y-4">
        {/* Search & Main Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search bar (5 cols) */}
          <div className="lg:col-span-4 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, slug, code..."
              className="gb-input has-icon !pl-10 text-xs py-2.5 bg-gray-50/70"
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>

          {/* Category Filter (3 cols) */}
          <div className="lg:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="gb-input text-xs py-2.5 bg-gray-50/70"
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter (2 cols) */}
          <div className="lg:col-span-2">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="gb-input text-xs py-2.5 bg-gray-50/70"
            >
              <option value="all">All Stock Status</option>
              <option value="in_stock">In Stock (&gt;0)</option>
              <option value="low_stock">Low Stock (&lt;15)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>

          {/* Sort By (3 cols) */}
          <div className="lg:col-span-3 flex items-center gap-2">
            <div className="relative flex-1">
              <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="gb-input pl-8 text-xs py-2.5 bg-gray-50/70"
              >
                <option value="newest">Sort: Default</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="stock_asc">Stock: Low to High</option>
              </select>
            </div>

            {(search || categoryFilter !== "all" || stockFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("all");
                  setStockFilter("all");
                  setStatusFilter("all");
                  setSortBy("newest");
                }}
                className="p-2.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-xs font-semibold shrink-0"
                title="Reset filters"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Pill Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
          <span className="text-gray-400 font-semibold text-[11px] mr-1 flex items-center gap-1">
            <Filter size={12} /> Status:
          </span>
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              statusFilter === "all"
                ? "bg-gb-green text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              statusFilter === "active"
                ? "bg-emerald-700 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter("draft")}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              statusFilter === "draft"
                ? "bg-gray-800 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Drafts ({totalProducts - activeCount})
          </button>
          <button
            onClick={() => setStatusFilter("featured")}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              statusFilter === "featured"
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            ★ Featured ({featuredCount})
          </button>
        </div>
      </div>

      {/* Mobile Products Card List (< md) */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center text-gray-400">
            <Package size={36} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-bold text-gray-700">No products match your filters</p>
            <p className="text-xs text-gray-400 mt-1">Try clearing search terms or resetting filters</p>
          </div>
        ) : (
          filtered.map((product, index) => {
            const minPrice =
              product.product_variants.length > 0
                ? Math.min(...product.product_variants.map((v) => v.price))
                : null;
            const totalStock = product.product_variants.reduce(
              (sum, v) => sum + v.stock_quantity,
              0
            );
            const productCode = `GB-${String(index + 101).padStart(3, "0")}`;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3"
              >
                {/* Product Info Row */}
                <div className="flex gap-3 items-start">
                  <div className="w-14 h-14 rounded-xl bg-gray-50 relative overflow-hidden shrink-0 border border-gray-200 p-1">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                        unoptimized={product.image_url.startsWith("data:")}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon size={18} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {productCode}
                      </span>
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {product.categories?.name ?? "General"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 truncate mt-1">
                      {product.name}
                    </h4>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-black text-gb-green font-mono">
                        {minPrice !== null ? formatPrice(minPrice) : "—"}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          totalStock > 0
                            ? "text-emerald-700 bg-emerald-50"
                            : "text-red-700 bg-red-50"
                        }`}
                      >
                        {totalStock > 0 ? `${totalStock} in stock` : "Out of stock"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Variants row */}
                {product.product_variants.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {product.product_variants.map((v) => (
                      <span
                        key={v.id}
                        className="text-[10px] font-semibold bg-gray-50 text-gray-600 border border-gray-200/60 px-2 py-0.5 rounded-md"
                      >
                        {v.label}: {formatPrice(v.price)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action buttons footer */}
                <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(product.id, product.is_active)}
                      disabled={isPending}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                        product.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${product.is_active ? "bg-green-600" : "bg-gray-400"}`} />
                      {product.is_active ? "Active" : "Draft"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(product.id, product.is_featured)}
                      disabled={isPending}
                      className={`p-1.5 rounded-lg border text-xs ${
                        product.is_featured
                          ? "text-amber-500 border-amber-200 bg-amber-50"
                          : "text-gray-400 border-gray-200 bg-gray-50"
                      }`}
                      title="Toggle featured"
                    >
                      <Star size={13} className={product.is_featured ? "fill-amber-400" : ""} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-xs font-bold text-gb-green bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit3 size={13} /> Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      disabled={isPending}
                      className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table Card (>= md) */}
      <div className="hidden md:block bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left" aria-label="Products catalogue">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-xs font-bold text-gray-500 px-5 py-3.5">Code</th>
                <th className="text-xs font-bold text-gray-500 px-5 py-3.5">Product</th>
                <th className="text-xs font-bold text-gray-500 px-5 py-3.5">Category</th>
                <th className="text-xs font-bold text-gray-500 px-5 py-3.5">Variants</th>
                <th className="text-xs font-bold text-gray-500 px-5 py-3.5">Price</th>
                <th className="text-xs font-bold text-gray-500 px-5 py-3.5">Stock</th>
                <th className="text-xs font-bold text-gray-500 px-5 py-3.5">Featured</th>
                <th className="text-xs font-bold text-gray-500 px-5 py-3.5">Status</th>
                <th className="text-right text-xs font-bold text-gray-500 px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-gray-400">
                    <Package size={36} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-bold text-gray-700">No products match your filters</p>
                    <p className="text-xs text-gray-400 mt-1">Try clearing search terms or resetting filters</p>
                  </td>
                </tr>
              ) : (
                filtered.map((product, index) => {
                  const minPrice =
                    product.product_variants.length > 0
                      ? Math.min(...product.product_variants.map((v) => v.price))
                      : null;
                  const totalStock = product.product_variants.reduce(
                    (sum, v) => sum + v.stock_quantity,
                    0
                  );

                  const productCode = `GB-${String(index + 101).padStart(3, "0")}`;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/70 transition-colors">
                      {/* Code / SKU Badge */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-md flex items-center gap-0.5 w-fit">
                          <Hash size={11} className="text-gray-400" />
                          {productCode}
                        </span>
                      </td>

                      {/* Product thumbnail + title */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 relative overflow-hidden shrink-0 border border-gray-200">
                            {product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                sizes="48px"
                                className="object-contain p-1"
                                unoptimized={product.image_url.startsWith("data:")}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ImageIcon size={18} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 leading-tight">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">
                              /{product.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4 text-xs font-medium text-gray-600">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-100/70 px-2.5 py-1 rounded-lg font-semibold">
                          {product.categories?.name ?? "General"}
                        </span>
                      </td>

                      {/* Variants */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {product.product_variants.slice(0, 3).map((v) => (
                            <span
                              key={v.id}
                              className="text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md"
                            >
                              {v.label}
                            </span>
                          ))}
                          {product.product_variants.length > 3 && (
                            <span className="text-[11px] text-gray-400 self-center font-bold">
                              +{product.product_variants.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4 text-sm font-bold text-gray-900">
                        {minPrice !== null ? formatPrice(minPrice) : "—"}
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                            totalStock > 20
                              ? "text-emerald-700 bg-emerald-50 border border-emerald-200/50"
                              : totalStock > 0
                              ? "text-amber-700 bg-amber-50 border border-amber-200/50"
                              : "text-red-700 bg-red-50 border border-red-200/50"
                          }`}
                        >
                          {totalStock > 0 ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <AlertTriangle size={12} />
                          )}
                          {totalStock} units
                        </span>
                      </td>

                      {/* Featured Star Toggle */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(product.id, product.is_featured)}
                          disabled={isPending}
                          className={`p-1.5 rounded-lg transition-colors ${
                            product.is_featured
                              ? "text-amber-500 hover:text-amber-600 bg-amber-50"
                              : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
                          }`}
                          title={product.is_featured ? "Remove from featured" : "Mark as featured"}
                        >
                          <Star size={16} className={product.is_featured ? "fill-amber-400" : ""} />
                        </button>
                      </td>

                      {/* Active Status Switch */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(product.id, product.is_active)}
                          disabled={isPending}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
                            product.is_active
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                          title="Click to toggle status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${product.is_active ? "bg-green-600" : "bg-gray-400"}`} />
                          {product.is_active ? "Active" : "Draft"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="p-1.5 text-gray-500 hover:text-gb-green hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit product"
                          >
                            <Edit3 size={15} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            disabled={isPending}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
