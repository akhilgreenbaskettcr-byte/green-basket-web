"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { generateSlug } from "@/lib/utils";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Category } from "@/types/database";

interface VariantInput {
  label: string;
  price: string;
  stock_quantity: string;
  sku: string;
}

interface NewProductFormProps {
  categories: Pick<Category, "id" | "name" | "slug">[];
}

export function NewProductForm({ categories }: NewProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [benefits, setBenefits] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [storageInfo, setStorageInfo] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [variants, setVariants] = useState<VariantInput[]>([
    { label: "500g", price: "", stock_quantity: "50", sku: "" },
  ]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setSlug(generateSlug(e.target.value));
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { label: "", price: "", stock_quantity: "50", sku: "" },
    ]);
  };

  const removeVariant = (i: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateVariant = (i: number, field: keyof VariantInput, value: string) => {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Product name is required.");
    if (!categoryId) return setError("Please select a category.");
    if (variants.length === 0) return setError("Add at least one variant.");
    if (variants.some((v) => !v.label.trim() || !v.price)) {
      return setError("All variants must have a label and price.");
    }

    startTransition(async () => {
      const supabase = createClient();

      // Create product
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: product, error: pError } = await (supabase as any)
        .from("products")
        .insert({
          name: name.trim(),
          slug: slug.trim() || generateSlug(name),
          category_id: categoryId,
          description: description.trim() || null,
          image_url: imageUrl.trim() || null,
          benefits: benefits.trim() || null,
          ingredients: ingredients.trim() || null,
          storage_info: storageInfo.trim() || null,
          is_active: true,
          is_featured: isFeatured,
        })
        .select("id")
        .single();

      if (pError || !product) {
        setError(pError?.message ?? "Failed to create product.");
        return;
      }

      // Create variants
      const variantRows = variants.map((v, i) => ({
        product_id: product.id,
        label: v.label.trim(),
        price: parseFloat(v.price),
        stock_quantity: parseInt(v.stock_quantity || "0"),
        sku: v.sku.trim() || null,
        sort_order: i,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: vError } = await (supabase as any)
        .from("product_variants")
        .insert(variantRows);

      if (vError) {
        setError(vError.message);
        return;
      }

      window.location.href = "/admin/products";
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/admin/products"
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors text-gray-600"
        >
          <ArrowLeft size={16} />
        </Link>
        <span className="text-sm text-gray-500">Back to products list</span>
      </div>

      {/* Main product info card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Product Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="product-name" className="gb-label">Product Name *</label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={handleNameChange}
              className="gb-input"
              placeholder="e.g. Fresh Cut Sambar Veg Mix"
              required
            />
          </div>
          <div>
            <label htmlFor="product-slug" className="gb-label">URL Slug</label>
            <input
              id="product-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="gb-input font-mono text-sm"
              placeholder="fresh-cut-sambar-veg-mix"
            />
          </div>
        </div>

        <div>
          <label htmlFor="product-category" className="gb-label">Category *</label>
          <select
            id="product-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="gb-input"
            required
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <ImageUpload
            label="Product Image"
            value={imageUrl}
            onChange={(url) => setImageUrl(url)}
            bucket="product-images"
            helperText="Upload product image or paste web URL"
          />
        </div>

        <div>
          <label htmlFor="product-description" className="gb-label">Short Description</label>
          <textarea
            id="product-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="gb-input resize-none"
            rows={3}
            placeholder="Pre-washed and sliced fresh vegetables ideal for authentic Kerala Sambar."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="gb-label">Benefits (optional)</label>
            <textarea
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              className="gb-input resize-none text-xs"
              rows={2}
              placeholder="100% natural, no preservatives..."
            />
          </div>
          <div>
            <label className="gb-label">Ingredients (optional)</label>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="gb-input resize-none text-xs"
              rows={2}
              placeholder="Shallots, pumpkin, drumstick..."
            />
          </div>
          <div>
            <label className="gb-label">Storage Info (optional)</label>
            <textarea
              value={storageInfo}
              onChange={(e) => setStorageInfo(e.target.value)}
              className="gb-input resize-none text-xs"
              rows={2}
              placeholder="Refrigerate at 4°C..."
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="rounded text-gb-green h-4 w-4"
          />
          <span className="text-sm font-semibold text-gray-700">
            Show on Homepage Popular Picks (Featured)
          </span>
        </label>
      </div>

      {/* Variants card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Pricing & Sizes (Variants)</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Add portion weights or bottle sizes with prices and stock levels.
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1 text-xs font-semibold text-gb-green bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={14} /> Add Size
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, i) => (
            <div
              key={i}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50/70 border border-gray-100 rounded-xl items-end"
            >
              <div>
                <label className="gb-label text-xs">Size / Portion *</label>
                <input
                  type="text"
                  value={v.label}
                  onChange={(e) => updateVariant(i, "label", e.target.value)}
                  className="gb-input text-sm py-2 bg-white"
                  placeholder="e.g. 500g"
                  required
                />
              </div>
              <div>
                <label className="gb-label text-xs">Price (₹) *</label>
                <input
                  type="number"
                  value={v.price}
                  onChange={(e) => updateVariant(i, "price", e.target.value)}
                  className="gb-input text-sm py-2 bg-white"
                  placeholder="85"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="gb-label text-xs">Stock Units</label>
                <input
                  type="number"
                  value={v.stock_quantity}
                  onChange={(e) => updateVariant(i, "stock_quantity", e.target.value)}
                  className="gb-input text-sm py-2 bg-white"
                  placeholder="50"
                  min="0"
                />
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="gb-label text-xs">SKU</label>
                  <input
                    type="text"
                    value={v.sku}
                    onChange={(e) => updateVariant(i, "sku", e.target.value)}
                    className="gb-input text-sm py-2 bg-white"
                    placeholder="GB-SAM-500"
                  />
                </div>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mb-0.5"
                    aria-label="Remove variant"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4" role="alert">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary shadow-md hover:shadow-lg transition-all"
          id="create-product-btn"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating Product…
            </>
          ) : (
            "Publish Product"
          )}
        </button>
        <Link
          href="/admin/products"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
