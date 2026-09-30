"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { updateProduct } from "@/app/actions/products";
import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  Check,
  Eye,
  Save,
  Sparkles,
  Lock,
  Unlock,
} from "lucide-react";
import Link from "next/link";
import type { Category, ProductVariant } from "@/types/database";

type UnitType = "kg" | "litre" | "piece" | "pack";

interface VariantInput {
  id?: string;
  label: string;
  quantity_value: string;
  price: string;
  compare_price: string;
  is_auto_priced: boolean;
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
    base_price?: number;
    unit_type?: UnitType;
    compare_base_price?: number | null;
    benefits: string | null;
    ingredients: string | null;
    storage_info: string | null;
    product_variants: (ProductVariant & {
      quantity_value?: number;
      is_auto_priced?: boolean;
    })[];
  };
  categories: Pick<Category, "id" | "name" | "slug">[];
}

const PRESET_SIZES: Record<UnitType, { label: string; qty: number }[]> = {
  kg: [
    { label: "100g", qty: 0.1 },
    { label: "250g", qty: 0.25 },
    { label: "500g", qty: 0.5 },
    { label: "1kg", qty: 1 },
    { label: "2kg", qty: 2 },
    { label: "5kg", qty: 5 },
  ],
  litre: [
    { label: "100ml", qty: 0.1 },
    { label: "200ml", qty: 0.2 },
    { label: "500ml", qty: 0.5 },
    { label: "1L", qty: 1 },
    { label: "2L", qty: 2 },
    { label: "5L", qty: 5 },
  ],
  piece: [
    { label: "1 pc", qty: 1 },
    { label: "2 pcs", qty: 2 },
    { label: "4 pcs", qty: 4 },
    { label: "6 pcs", qty: 6 },
    { label: "12 pcs", qty: 12 },
  ],
  pack: [
    { label: "1 pack", qty: 1 },
    { label: "2 packs", qty: 2 },
    { label: "3 packs", qty: 3 },
    { label: "5 packs", qty: 5 },
  ],
};

function inferQuantityFromLabel(label: string): number {
  const l = label.toLowerCase().trim();
  if (l.includes("100g") || l.includes("100ml")) return 0.1;
  if (l.includes("200g") || l.includes("200ml")) return 0.2;
  if (l.includes("250g") || l.includes("250ml")) return 0.25;
  if (l.includes("400g") || l.includes("400ml")) return 0.4;
  if (l.includes("500g") || l.includes("500ml")) return 0.5;
  if (l.includes("750g") || l.includes("750ml")) return 0.75;
  if (l.includes("1kg") || l.includes("1 kg") || l.includes("1l") || l.includes("1 l") || l.includes("1 litre")) return 1;
  if (l.includes("2kg") || l.includes("2 kg") || l.includes("2l") || l.includes("2 l")) return 2;
  if (l.includes("5kg") || l.includes("5 kg") || l.includes("5l") || l.includes("5 l")) return 5;
  if (l.includes("2 pc") || l.includes("2pc")) return 2;
  if (l.includes("4 pc") || l.includes("4pc")) return 4;
  if (l.includes("6 pc") || l.includes("6pc")) return 6;
  if (l.includes("12 pc") || l.includes("12pc")) return 12;
  return 1;
}

function calculatePriceFromBase(base: number, qty: number): string {
  if (isNaN(base) || base <= 0 || isNaN(qty) || qty <= 0) return "";
  const calculated = Math.round(base * qty * 100) / 100;
  return calculated.toString();
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

  // Determine initial unit type
  const initialUnitType: UnitType =
    product.unit_type ||
    (product.product_variants.some((v) => v.label.toLowerCase().includes("ml") || v.label.toLowerCase().includes("l"))
      ? "litre"
      : "kg");

  // Determine initial base price (if 0 or missing, infer from 1-unit variant or largest ratio)
  let initialBase = product.base_price?.toString() || "";
  if (!initialBase || parseFloat(initialBase) === 0) {
    const unit1Var = product.product_variants.find(
      (v) => (v.quantity_value === 1) || inferQuantityFromLabel(v.label) === 1
    );
    if (unit1Var) {
      initialBase = unit1Var.price.toString();
    } else if (product.product_variants.length > 0) {
      const first = product.product_variants[0];
      const q = first.quantity_value || inferQuantityFromLabel(first.label) || 1;
      initialBase = (first.price / q).toFixed(2);
    }
  }

  const [unitType, setUnitType] = useState<UnitType>(initialUnitType);
  const [basePrice, setBasePrice] = useState(initialBase);
  const [compareBasePrice, setCompareBasePrice] = useState(
    product.compare_base_price ? product.compare_base_price.toString() : ""
  );

  const [variants, setVariants] = useState<VariantInput[]>(
    product.product_variants
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((v) => {
        const qVal = v.quantity_value != null && v.quantity_value > 0
          ? v.quantity_value
          : inferQuantityFromLabel(v.label);
        const isAuto = v.is_auto_priced !== undefined ? v.is_auto_priced : true;

        return {
          id: v.id,
          label: v.label,
          quantity_value: qVal.toString(),
          price: v.price.toString(),
          compare_price: v.compare_price ? v.compare_price.toString() : "",
          is_auto_priced: isAuto,
          stock_quantity: v.stock_quantity.toString(),
          sku: v.sku ?? "",
        };
      })
  );

  const handleBasePriceChange = (newBase: string) => {
    setBasePrice(newBase);
    const baseNum = parseFloat(newBase) || 0;
    const cmpNum = parseFloat(compareBasePrice) || 0;

    setVariants((prev) =>
      prev.map((v) => {
        if (!v.is_auto_priced) return v;
        const qVal = parseFloat(v.quantity_value) || 0;
        return {
          ...v,
          price: calculatePriceFromBase(baseNum, qVal),
          compare_price: cmpNum > 0 ? calculatePriceFromBase(cmpNum, qVal) : "",
        };
      })
    );
  };

  const handleCompareBasePriceChange = (newCmp: string) => {
    setCompareBasePrice(newCmp);
    const cmpNum = parseFloat(newCmp) || 0;

    setVariants((prev) =>
      prev.map((v) => {
        if (!v.is_auto_priced) return v;
        const qVal = parseFloat(v.quantity_value) || 0;
        return {
          ...v,
          compare_price: cmpNum > 0 ? calculatePriceFromBase(cmpNum, qVal) : "",
        };
      })
    );
  };

  const addPresetVariant = (preset: { label: string; qty: number }) => {
    if (variants.some((v) => v.label.toLowerCase() === preset.label.toLowerCase())) {
      return;
    }
    const baseNum = parseFloat(basePrice) || 0;
    const cmpNum = parseFloat(compareBasePrice) || 0;

    setVariants((prev) => [
      ...prev,
      {
        label: preset.label,
        quantity_value: preset.qty.toString(),
        price: calculatePriceFromBase(baseNum, preset.qty),
        compare_price: cmpNum > 0 ? calculatePriceFromBase(cmpNum, preset.qty) : "",
        is_auto_priced: true,
        stock_quantity: "50",
        sku: "",
      },
    ]);
  };

  const addCustomVariant = () => {
    const baseNum = parseFloat(basePrice) || 0;
    const cmpNum = parseFloat(compareBasePrice) || 0;
    setVariants((prev) => [
      ...prev,
      {
        label: "",
        quantity_value: "1",
        price: calculatePriceFromBase(baseNum, 1),
        compare_price: cmpNum > 0 ? calculatePriceFromBase(cmpNum, 1) : "",
        is_auto_priced: true,
        stock_quantity: "50",
        sku: "",
      },
    ]);
  };

  const removeVariant = (i: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateVariant = (i: number, field: keyof VariantInput, value: any) => {
    setVariants((prev) =>
      prev.map((v, idx) => {
        if (idx !== i) return v;
        const updated = { ...v, [field]: value };

        if (field === "quantity_value" && updated.is_auto_priced) {
          const baseNum = parseFloat(basePrice) || 0;
          const cmpNum = parseFloat(compareBasePrice) || 0;
          const qVal = parseFloat(value) || 0;
          updated.price = calculatePriceFromBase(baseNum, qVal);
          updated.compare_price = cmpNum > 0 ? calculatePriceFromBase(cmpNum, qVal) : "";
        }

        if (field === "is_auto_priced" && value === true) {
          const baseNum = parseFloat(basePrice) || 0;
          const cmpNum = parseFloat(compareBasePrice) || 0;
          const qVal = parseFloat(updated.quantity_value) || 0;
          updated.price = calculatePriceFromBase(baseNum, qVal);
          updated.compare_price = cmpNum > 0 ? calculatePriceFromBase(cmpNum, qVal) : "";
        }

        return updated;
      })
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
    if (!basePrice || parseFloat(basePrice) <= 0) {
      setError("Please set a valid base price.");
      return;
    }
    if (variants.length === 0) {
      setError("Please add at least one product size/variant.");
      return;
    }
    if (variants.some((v) => !v.label.trim() || !v.price)) {
      setError("All variants must have a label and price.");
      return;
    }

    setIsSaving(true);

    try {
      const baseNum = parseFloat(basePrice) || 0;
      const cmpBaseNum = parseFloat(compareBasePrice) || null;

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
        base_price: baseNum,
        unit_type: unitType,
        compare_base_price: cmpBaseNum && cmpBaseNum > 0 ? cmpBaseNum : null,
        variants: variants.map((v, idx) => {
          const qVal = parseFloat(v.quantity_value) || 1;
          const finalPrice = v.is_auto_priced
            ? Math.round(baseNum * qVal * 100) / 100
            : parseFloat(v.price) || 0;
          const finalComparePrice = v.is_auto_priced && cmpBaseNum
            ? Math.round(cmpBaseNum * qVal * 100) / 100
            : (parseFloat(v.compare_price) || null);

          return {
            id: v.id,
            label: v.label.trim(),
            price: finalPrice,
            compare_price: finalComparePrice,
            quantity_value: qVal,
            is_auto_priced: v.is_auto_priced,
            stock_quantity: parseInt(v.stock_quantity || "0"),
            sku: v.sku.trim() || null,
            sort_order: idx,
          };
        }),
      };

      const serverResult = await updateProduct(payload);

      if (!serverResult.success) {
        throw new Error(serverResult.error || "Failed to update product");
      }

      setSuccess(true);
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

  const getUnitDisplayName = () => {
    switch (unitType) {
      case "kg":
        return "1 kg";
      case "litre":
        return "1 Litre";
      case "piece":
        return "1 Piece";
      case "pack":
        return "1 Pack";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
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
            className="btn-primary flex items-center gap-1.5 text-xs px-5 py-2.5 shadow-2xs cursor-pointer"
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
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-5 shadow-2xs">
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
            className="gb-input font-medium"
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="gb-label">Benefits (optional)</label>
            <textarea
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              className="gb-input resize-none text-xs"
              rows={2}
            />
          </div>
          <div>
            <label className="gb-label">Ingredients (optional)</label>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="gb-input resize-none text-xs"
              rows={2}
            />
          </div>
          <div>
            <label className="gb-label">Storage Info (optional)</label>
            <textarea
              value={storageInfo}
              onChange={(e) => setStorageInfo(e.target.value)}
              className="gb-input resize-none text-xs"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Base Pricing & Measurement Unit Setup */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-5 shadow-2xs">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={18} className="text-gb-green" /> 2. Base Pricing & Measurement Unit
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Setting the base price for 1 unit automatically recalculates all linked size variant prices in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="gb-label text-xs font-bold text-gray-700">
              Measurement Unit Type *
            </label>
            <select
              value={unitType}
              onChange={(e) => setUnitType(e.target.value as UnitType)}
              className="gb-input font-bold bg-green-50/50 border-gb-green/30"
            >
              <option value="kg">Kilogram / Grams (kg, g)</option>
              <option value="litre">Litre / Millilitre (L, ml)</option>
              <option value="piece">Count / Pieces (pcs)</option>
              <option value="pack">Pack / Bundle (pack)</option>
            </select>
          </div>

          <div>
            <label className="gb-label text-xs font-bold text-gray-700">
              Base Price for {getUnitDisplayName()} (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={basePrice}
              onChange={(e) => handleBasePriceChange(e.target.value)}
              className="gb-input font-black text-gb-charcoal bg-amber-50/40 border-amber-300"
              placeholder="e.g. 200"
              required
            />
            <p className="text-[11px] text-gray-400 mt-1">Selling price for 1 full unit</p>
          </div>

          <div>
            <label className="gb-label text-xs font-bold text-gray-700">
              Compare / MRP Base Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={compareBasePrice}
              onChange={(e) => handleCompareBasePriceChange(e.target.value)}
              className="gb-input text-gray-500"
              placeholder="e.g. 240 (optional)"
            />
            <p className="text-[11px] text-gray-400 mt-1">Strikethrough reference MRP</p>
          </div>
        </div>
      </div>

      {/* Variants & Pricing Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">3. Variants & Portion Sizes</h2>
            <p className="text-xs text-gray-400">
              Auto-prices derived from {basePrice ? `₹${basePrice}` : "₹0"} / {getUnitDisplayName()}
            </p>
          </div>
          <button
            type="button"
            onClick={addCustomVariant}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gb-green bg-green-50 hover:bg-green-100 px-3.5 py-2 rounded-xl transition-colors shrink-0"
          >
            <Plus size={13} /> Custom Size
          </button>
        </div>

        {/* Quick Add Presets */}
        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/80">
          <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
            Quick Add Preset Sizes for {unitType.toUpperCase()}:
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESET_SIZES[unitType].map((preset) => {
              const exists = variants.some((v) => v.label.toLowerCase() === preset.label.toLowerCase());
              const autoCalculated = parseFloat(basePrice) > 0 ? (parseFloat(basePrice) * preset.qty).toFixed(0) : "";
              return (
                <button
                  key={preset.label}
                  type="button"
                  disabled={exists}
                  onClick={() => addPresetVariant(preset)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                    exists
                      ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                      : "bg-white text-gray-800 border-gray-300 hover:border-gb-green hover:bg-green-50 cursor-pointer shadow-2xs"
                  }`}
                >
                  <Plus size={12} className={exists ? "hidden" : "text-gb-green"} />
                  <span>{preset.label}</span>
                  {autoCalculated && <span className="text-[10px] text-gray-500 font-mono">₹{autoCalculated}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Variants List */}
        <div className="space-y-3 pt-1">
          {variants.map((v, i) => {
            const qVal = parseFloat(v.quantity_value) || 0;

            return (
              <div
                key={v.id || i}
                className="grid grid-cols-12 gap-3 p-4 bg-gray-50/80 rounded-xl items-center border border-gray-200/70"
              >
                {/* Size Label */}
                <div className="col-span-6 sm:col-span-3">
                  <label className="text-[11px] font-bold text-gray-500 mb-1 block">
                    Size Label *
                  </label>
                  <input
                    type="text"
                    value={v.label}
                    onChange={(e) => updateVariant(i, "label", e.target.value)}
                    placeholder="e.g. 500g"
                    className="gb-input text-xs py-2 bg-white font-bold"
                    required
                  />
                </div>

                {/* Ratio */}
                <div className="col-span-6 sm:col-span-2">
                  <label className="text-[11px] font-bold text-gray-500 mb-1 block">
                    Ratio ({unitType}) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={v.quantity_value}
                    onChange={(e) => updateVariant(i, "quantity_value", e.target.value)}
                    placeholder="0.5"
                    className="gb-input text-xs py-2 bg-white font-mono"
                    required
                  />
                </div>

                {/* Price */}
                <div className="col-span-6 sm:col-span-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-gray-500">
                      Price (₹) *
                    </label>
                    <button
                      type="button"
                      onClick={() => updateVariant(i, "is_auto_priced", !v.is_auto_priced)}
                      className="text-[10px] text-gray-500 hover:text-gb-green flex items-center gap-0.5 font-medium"
                      title={v.is_auto_priced ? "Switch to manual custom price" : "Reset to auto-calculated base price"}
                    >
                      {v.is_auto_priced ? (
                        <>
                          <Lock size={10} className="text-gb-green" /> Auto ({Math.round(qVal * 100)}%)
                        </>
                      ) : (
                        <>
                          <Unlock size={10} className="text-amber-600" /> Custom
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={v.price}
                    onChange={(e) => updateVariant(i, "price", e.target.value)}
                    readOnly={v.is_auto_priced}
                    placeholder="Auto"
                    className={`gb-input text-xs py-2 font-bold ${
                      v.is_auto_priced
                        ? "bg-green-50/70 border-green-200 text-gb-green font-black"
                        : "bg-white border-amber-300 text-gray-900"
                    }`}
                    required
                  />
                </div>

                {/* Stock Quantity */}
                <div className="col-span-5 sm:col-span-2">
                  <label className="text-[11px] font-bold text-gray-500 mb-1 block">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={v.stock_quantity}
                    onChange={(e) => updateVariant(i, "stock_quantity", e.target.value)}
                    placeholder="50"
                    className="gb-input text-xs py-2 bg-white font-mono"
                  />
                </div>

                {/* Delete / SKU */}
                <div className="col-span-7 sm:col-span-2 flex items-center gap-2 pt-4">
                  <input
                    type="text"
                    value={v.sku}
                    onChange={(e) => updateVariant(i, "sku", e.target.value)}
                    placeholder="SKU"
                    className="gb-input text-xs py-2 bg-white flex-1 font-mono"
                  />
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      aria-label="Remove variant"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visibility & Status */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-4 shadow-2xs">
        <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
          4. Store Visibility
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
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 bg-white p-5 rounded-2xl border shadow-2xs">
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
            className="btn-primary text-xs px-6 py-2.5 shadow-2xs cursor-pointer"
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
