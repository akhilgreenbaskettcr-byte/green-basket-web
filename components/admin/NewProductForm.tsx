"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { generateSlug } from "@/lib/utils";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Plus, Trash2, Loader2, ArrowLeft, Sparkles, RefreshCw, Lock, Unlock } from "lucide-react";
import Link from "next/link";
import type { Category } from "@/types/database";

type UnitType = "kg" | "litre" | "piece" | "pack";

interface VariantInput {
  label: string;
  quantity_value: string;
  price: string;
  compare_price: string;
  is_auto_priced: boolean;
  stock_quantity: string;
  sku: string;
}

interface NewProductFormProps {
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

function calculatePriceFromBase(base: number, qty: number): string {
  if (isNaN(base) || base <= 0 || isNaN(qty) || qty <= 0) return "";
  const calculated = Math.round(base * qty * 100) / 100;
  return calculated.toString();
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

  // Pricing & Unit States
  const [unitType, setUnitType] = useState<UnitType>("kg");
  const [basePrice, setBasePrice] = useState("");
  const [compareBasePrice, setCompareBasePrice] = useState("");

  const [variants, setVariants] = useState<VariantInput[]>([
    {
      label: "500g",
      quantity_value: "0.5",
      price: "",
      compare_price: "",
      is_auto_priced: true,
      stock_quantity: "50",
      sku: "",
    },
    {
      label: "1kg",
      quantity_value: "1",
      price: "",
      compare_price: "",
      is_auto_priced: true,
      stock_quantity: "50",
      sku: "",
    },
  ]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setSlug(generateSlug(e.target.value));
  };

  // Recalculate auto-priced variants whenever base prices change
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

  const handleUnitTypeChange = (newUnit: UnitType) => {
    setUnitType(newUnit);
    // If switching unit type, adapt the default first variant
    if (newUnit === "litre") {
      setVariants([
        {
          label: "500ml",
          quantity_value: "0.5",
          price: calculatePriceFromBase(parseFloat(basePrice) || 0, 0.5),
          compare_price: calculatePriceFromBase(parseFloat(compareBasePrice) || 0, 0.5),
          is_auto_priced: true,
          stock_quantity: "50",
          sku: "",
        },
        {
          label: "1L",
          quantity_value: "1",
          price: calculatePriceFromBase(parseFloat(basePrice) || 0, 1),
          compare_price: calculatePriceFromBase(parseFloat(compareBasePrice) || 0, 1),
          is_auto_priced: true,
          stock_quantity: "50",
          sku: "",
        },
      ]);
    } else if (newUnit === "piece" || newUnit === "pack") {
      setVariants([
        {
          label: newUnit === "piece" ? "1 pc" : "1 pack",
          quantity_value: "1",
          price: calculatePriceFromBase(parseFloat(basePrice) || 0, 1),
          compare_price: calculatePriceFromBase(parseFloat(compareBasePrice) || 0, 1),
          is_auto_priced: true,
          stock_quantity: "50",
          sku: "",
        },
      ]);
    } else {
      setVariants([
        {
          label: "500g",
          quantity_value: "0.5",
          price: calculatePriceFromBase(parseFloat(basePrice) || 0, 0.5),
          compare_price: calculatePriceFromBase(parseFloat(compareBasePrice) || 0, 0.5),
          is_auto_priced: true,
          stock_quantity: "50",
          sku: "",
        },
        {
          label: "1kg",
          quantity_value: "1",
          price: calculatePriceFromBase(parseFloat(basePrice) || 0, 1),
          compare_price: calculatePriceFromBase(parseFloat(compareBasePrice) || 0, 1),
          is_auto_priced: true,
          stock_quantity: "50",
          sku: "",
        },
      ]);
    }
  };

  const addPresetVariant = (preset: { label: string; qty: number }) => {
    // Check if variant already exists
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

    if (!name.trim()) return setError("Product name is required.");
    if (!categoryId) return setError("Please select a category.");
    if (!basePrice || parseFloat(basePrice) <= 0) {
      return setError("Please specify a valid base price (per 1 unit).");
    }
    if (variants.length === 0) return setError("Add at least one size variant.");
    if (variants.some((v) => !v.label.trim() || !v.price)) {
      return setError("All variants must have a label and calculated price.");
    }

    startTransition(async () => {
      const supabase = createClient();
      const baseNum = parseFloat(basePrice) || 0;
      const cmpBaseNum = parseFloat(compareBasePrice) || null;

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
          base_price: baseNum,
          unit_type: unitType,
          compare_base_price: cmpBaseNum && cmpBaseNum > 0 ? cmpBaseNum : null,
        })
        .select("id")
        .single();

      if (pError || !product) {
        setError(pError?.message ?? "Failed to create product.");
        return;
      }

      // Create variants
      const variantRows = variants.map((v, i) => {
        const qVal = parseFloat(v.quantity_value) || 1;
        const finalPrice = v.is_auto_priced ? Math.round(baseNum * qVal * 100) / 100 : parseFloat(v.price);
        const finalComparePrice = v.is_auto_priced && cmpBaseNum
          ? Math.round(cmpBaseNum * qVal * 100) / 100
          : (parseFloat(v.compare_price) || null);

        return {
          product_id: product.id,
          label: v.label.trim(),
          price: finalPrice,
          compare_price: finalComparePrice,
          quantity_value: qVal,
          is_auto_priced: v.is_auto_priced,
          stock_quantity: parseInt(v.stock_quantity || "0"),
          sku: v.sku.trim() || null,
          sort_order: i,
        };
      });

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
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/admin/products"
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors text-gray-600"
        >
          <ArrowLeft size={16} />
        </Link>
        <span className="text-sm text-gray-500 font-medium">Back to products list</span>
      </div>

      {/* Main product info card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-5 shadow-xs">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
          1. General Product Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="product-name" className="gb-label">Product Name *</label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={handleNameChange}
              className="gb-input font-bold"
              placeholder="e.g. Fresh Coconut Oil or Sambar Mix"
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
              placeholder="fresh-coconut-oil"
            />
          </div>
        </div>

        <div>
          <label htmlFor="product-category" className="gb-label">Category *</label>
          <select
            id="product-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="gb-input font-medium"
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
            label="Product Photography"
            value={imageUrl}
            onChange={(url) => setImageUrl(url)}
            folder="product-images"
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
            placeholder="Fresh cold-pressed organic coconut oil, prepared with traditional standards."
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
              placeholder="100% natural, pure cold-pressed..."
            />
          </div>
          <div>
            <label className="gb-label">Ingredients (optional)</label>
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="gb-input resize-none text-xs"
              rows={2}
              placeholder="Fresh harvested coconuts..."
            />
          </div>
          <div>
            <label className="gb-label">Storage Info (optional)</label>
            <textarea
              value={storageInfo}
              onChange={(e) => setStorageInfo(e.target.value)}
              className="gb-input resize-none text-xs"
              rows={2}
              placeholder="Store in a cool dry place..."
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

      {/* Base Pricing & Unit Setup Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-5 shadow-xs">
        <div className="border-b border-gray-100 pb-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={18} className="text-gb-green" /> 2. Base Pricing & Measurement Unit
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Set the master base price for 1 Unit (1 kg / 1 Litre / 1 Piece). All size variants will automatically calculate prices based on this.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="gb-label text-xs font-bold text-gray-700">
              Measurement Unit Type *
            </label>
            <select
              value={unitType}
              onChange={(e) => handleUnitTypeChange(e.target.value as UnitType)}
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

      {/* Variants & Portion Sizes Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">3. Portion Sizes & Auto-Calculated Pricing</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Prices auto-calculate from Base Price ({basePrice ? `₹${basePrice}` : "₹0"} / {getUnitDisplayName()}).
            </p>
          </div>
          <button
            type="button"
            onClick={addCustomVariant}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gb-green bg-green-50 hover:bg-green-100 px-3.5 py-2 rounded-xl transition-colors shrink-0"
          >
            <Plus size={14} /> Custom Size
          </button>
        </div>

        {/* Quick-Add Preset Size Buttons */}
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

        {/* Variant Rows List */}
        <div className="space-y-3 pt-1">
          {variants.map((v, i) => {
            const baseNum = parseFloat(basePrice) || 0;
            const qVal = parseFloat(v.quantity_value) || 0;
            const autoPrice = Math.round(baseNum * qVal * 100) / 100;

            return (
              <div
                key={i}
                className="grid grid-cols-12 gap-3 p-4 bg-gray-50/90 border border-gray-200 rounded-xl items-center"
              >
                {/* Size Label */}
                <div className="col-span-6 sm:col-span-3">
                  <label className="text-[11px] font-bold text-gray-600 mb-1 block">
                    Size Label *
                  </label>
                  <input
                    type="text"
                    value={v.label}
                    onChange={(e) => updateVariant(i, "label", e.target.value)}
                    className="gb-input text-xs py-2 bg-white font-bold"
                    placeholder="e.g. 500g"
                    required
                  />
                </div>

                {/* Quantity Ratio / Multiplier */}
                <div className="col-span-6 sm:col-span-2">
                  <label className="text-[11px] font-bold text-gray-600 mb-1 block">
                    Ratio ({unitType}) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={v.quantity_value}
                    onChange={(e) => updateVariant(i, "quantity_value", e.target.value)}
                    className="gb-input text-xs py-2 bg-white font-mono"
                    placeholder="0.5"
                    required
                  />
                </div>

                {/* Calculated / Custom Price */}
                <div className="col-span-6 sm:col-span-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-gray-600">
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
                    className={`gb-input text-xs py-2 font-bold ${
                      v.is_auto_priced
                        ? "bg-green-50/70 border-green-200 text-gb-green font-black"
                        : "bg-white border-amber-300 text-gray-900"
                    }`}
                    placeholder="Auto"
                    required
                  />
                </div>

                {/* Stock Quantity */}
                <div className="col-span-5 sm:col-span-2">
                  <label className="text-[11px] font-bold text-gray-600 mb-1 block">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={v.stock_quantity}
                    onChange={(e) => updateVariant(i, "stock_quantity", e.target.value)}
                    className="gb-input text-xs py-2 bg-white font-mono"
                    placeholder="50"
                  />
                </div>

                {/* SKU + Remove Button */}
                <div className="col-span-7 sm:col-span-2 flex items-center gap-2 pt-4">
                  <input
                    type="text"
                    value={v.sku}
                    onChange={(e) => updateVariant(i, "sku", e.target.value)}
                    className="gb-input text-xs py-2 bg-white flex-1 font-mono"
                    placeholder="SKU"
                  />
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      aria-label="Remove variant"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4" role="alert">
          <p className="text-red-600 text-sm font-semibold">{error}</p>
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
