"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { updateProduct } from "@/app/actions/products";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Plus, Trash2, Loader2, ArrowLeft, Check, Eye, Save } from "lucide-react";
import Link from "next/link";
import type { Category, ProductVariant } from "@/types/database";

interface VariantInput {
  id?: string;
  label: string;
  price: string;
  stock_quantity: string;
  sku: string;
}

interface EditProductFormProps {
  product: {
    id: string;
    name: string;
    slug: string;
    category_id: string;
    description: string | null;
    image_url: string | null;
    is_active: boolean;
    is_featured: boolean;
    benefits: string | null;
    ingredients: string | null;
    storage_info: string | null;
    product_variants: ProductVariant[];
  };
  categories: Pick<Category, "id" | "name" | "slug">[];
}

export function EditProductForm({ product, categories }: EditProductFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [categoryId, setCategoryId] = useState(product.category_id);
  const [imageUrl, setImageUrl] = useState(product.image_url ?? "");
  const [description, setDescription] = useState(product.description ?? "");
  const [benefits, setBenefits] = useState(product.benefits ?? "");
  const [ingredients, setIngredients] = useState(product.ingredients ?? "");
  const [storageInfo, setStorageInfo] = useState(product.storage_info ?? "");
  const [isActive, setIsActive] = useState(product.is_active);
  const [isFeatured, setIsFeatured] = useState(product.is_featured);

  const [variants, setVariants] = useState<VariantInput[]>(
    product.product_variants
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((v) => ({
        id: v.id,
        label: v.label,
        price: v.price.toString(),
        stock_quantity: v.stock_quantity.toString(),
        sku: v.sku ?? "",
      }))
  );

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
    setSuccess(false);

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (variants.length === 0) {
      setError("Please add at least one product size/variant.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        id: product.id,
        name: name.trim(),
        slug: slug.trim(),
        category_id: categoryId,
        image_url: imageUrl.trim() || null,
        description: description.trim() || null,
        benefits: benefits.trim() || null,
        ingredients: ingredients.trim() || null,
        storage_info: storageInfo.trim() || null,
        is_active: isActive,
        is_featured: isFeatured,
        variants: variants.map((v, idx) => ({
          id: v.id,
          label: v.label.trim(),
          price: parseFloat(v.price) || 0,
          stock_quantity: parseInt(v.stock_quantity || "0"),
          sku: v.sku.trim() || null,
          sort_order: idx,
        })),
      };

      // 1. First attempt server action
      const serverResult = await updateProduct(payload);

      if (!serverResult.success) {
        // Fallback: direct Supabase client call
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: clientError } = await (supabase as any)
          .from("products")
          .update({
            name: name.trim(),
            slug: slug.trim(),
            category_id: categoryId,
            image_url: imageUrl.trim() || null,
            description: description.trim() || null,
            benefits: benefits.trim() || null,
            ingredients: ingredients.trim() || null,
            storage_info: storageInfo.trim() || null,
            is_active: isActive,
            is_featured: isFeatured,
          })
          .eq("id", product.id);

        if (clientError) {
          throw new Error(clientError.message || serverResult.error);
        }
      }

      setSuccess(true);
      // Hard instantaneous browser redirect to products directory
      window.location.href = "/admin/products";
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save product changes.");
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${product.name}"? This will permanently remove the product.`)) return;

    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("products").delete().eq("id", product.id);
      window.location.href = "/admin/products";
    } catch (err: any) {
      setError(err.message || "Failed to delete product.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors text-gray-600"
            title="Return to Products"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{name || "Edit Product"}</h1>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Ref: #{slug}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <Eye size={14} /> Store View
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary flex items-center gap-1.5 text-xs px-5 py-2.5 shadow-sm cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving & Returning…
              </>
            ) : (
              <>
                <Save size={14} /> Save & Return
              </>
            )}
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-4 rounded-2xl flex items-center gap-2">
          <Check size={16} className="text-emerald-600 shrink-0" />
          Product updated successfully! Returning to products list…
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-4 rounded-2xl">
          {error}
        </div>
      )}

      {/* Main product card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-5 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
          1. General Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-product-name" className="gb-label">Product Name *</label>
            <input
              id="edit-product-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="gb-input font-bold"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-product-slug" className="gb-label">URL Slug</label>
            <input
              id="edit-product-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="gb-input font-mono text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="edit-product-category" className="gb-label">Category *</label>
          <select
            id="edit-product-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="gb-input"
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <ImageUpload
            label="Product Photography"
            value={imageUrl}
            onChange={(url) => setImageUrl(url)}
            folder="product-images"
            helperText="Upload high-res product photo to Cloudinary CDN"
          />
        </div>

        <div>
          <label htmlFor="edit-product-description" className="gb-label">Short Description</label>
          <textarea
            id="edit-product-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="gb-input resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Variants & Pricing Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">2. Variants & Pricing</h2>
            <p className="text-xs text-gray-400">Manage package sizes (e.g. 250g, 500g, 1kg)</p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gb-green bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={13} /> Add Size Variant
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-3 p-4 bg-gray-50/80 rounded-xl items-center border border-gray-200/70"
            >
              <div className="col-span-12 sm:col-span-4">
                <label className="text-[11px] font-semibold text-gray-500 mb-1 block">
                  Label (e.g. 500g) *
                </label>
                <input
                  type="text"
                  value={v.label}
                  onChange={(e) => updateVariant(i, "label", e.target.value)}
                  placeholder="500g"
                  className="gb-input text-xs py-2 bg-white"
                  required
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label className="text-[11px] font-semibold text-gray-500 mb-1 block">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={v.price}
                  onChange={(e) => updateVariant(i, "price", e.target.value)}
                  placeholder="65"
                  className="gb-input text-xs py-2 bg-white font-bold"
                  required
                />
              </div>

              <div className="col-span-5 sm:col-span-3">
                <label className="text-[11px] font-semibold text-gray-500 mb-1 block">
                  Stock Units
                </label>
                <input
                  type="number"
                  min="0"
                  value={v.stock_quantity}
                  onChange={(e) => updateVariant(i, "stock_quantity", e.target.value)}
                  placeholder="50"
                  className="gb-input text-xs py-2 bg-white"
                />
              </div>

              <div className="col-span-1 flex justify-end pt-5">
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visibility & Status */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
          3. Store Visibility
        </h2>

        <div className="flex flex-wrap gap-6 pt-2">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-gb-green rounded border-gray-300"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">Active in Store</p>
              <p className="text-xs text-gray-400">Visible for customers to buy</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 text-gb-green rounded border-gray-300"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">Featured Item</p>
              <p className="text-xs text-gray-400">Highlighted on homepage</p>
            </div>
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-4 rounded-2xl">
          {error}
        </div>
      )}

      {/* Footer controls */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 bg-white p-5 rounded-2xl border shadow-sm">
        <button
          type="button"
          onClick={handleDelete}
          className="text-xs text-red-600 hover:text-red-800 font-semibold px-4 py-2 hover:bg-red-50 rounded-xl transition-colors"
        >
          Delete Product
        </button>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-4 py-2.5"
          >
            Cancel & Close
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary text-xs px-6 py-2.5 shadow-sm cursor-pointer"
            id="save-product-and-close-btn"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving & Returning…
              </>
            ) : (
              "Save Changes & Close"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
