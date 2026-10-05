"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface UpdateProductPayload {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  image_url: string | null;
  description: string | null;
  benefits: string | null;
  ingredients: string | null;
  storage_info: string | null;
  is_active: boolean;
  is_featured: boolean;
  base_price: number;
  unit_type: "kg" | "litre" | "piece" | "pack";
  compare_base_price?: number | null;
  variants: {
    id?: string;
    label: string;
    price: number;
    compare_price?: number | null;
    quantity_value?: number;
    is_auto_priced?: boolean;
    stock_quantity: number;
    sku: string | null;
    sort_order: number;
  }[];
}

export async function updateProduct(payload: UpdateProductPayload) {
  try {
    const supabase = await createClient();

    const basePrice = Number(payload.base_price) || 0;
    const compareBasePrice = payload.compare_base_price != null && payload.compare_base_price > 0 
      ? Number(payload.compare_base_price) 
      : null;

    // 1. Update product main table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: pError } = await (supabase as any)
      .from("products")
      .update({
        name: payload.name.trim(),
        slug: payload.slug.trim(),
        category_id: payload.category_id,
        image_url: payload.image_url?.trim() || null,
        description: payload.description?.trim() || null,
        benefits: payload.benefits?.trim() || null,
        ingredients: payload.ingredients?.trim() || null,
        storage_info: payload.storage_info?.trim() || null,
        is_active: payload.is_active,
        is_featured: payload.is_featured,
        base_price: basePrice,
        unit_type: payload.unit_type || "kg",
        compare_base_price: compareBasePrice,
      })
      .eq("id", payload.id);

    if (pError) {
      console.error("Error updating product:", pError);
      return { success: false, error: pError.message };
    }

    // 2. Handle variants safely
    // Fetch existing variants
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingVariants } = await (supabase as any)
      .from("product_variants")
      .select("id")
      .eq("product_id", payload.id);

    const existingIds = (existingVariants || []).map((v: { id: string }) => v.id);
    const keptIds = payload.variants.filter((v) => v.id).map((v) => v.id!);
    const toDeleteIds = existingIds.filter((id: string) => !keptIds.includes(id));

    // Delete removed variants
    if (toDeleteIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("product_variants").delete().in("id", toDeleteIds);
    }

    // Update or insert variants
    for (const v of payload.variants) {
      const isAuto = v.is_auto_priced !== false;
      const qVal = v.quantity_value != null && v.quantity_value > 0 ? Number(v.quantity_value) : 1;
      
      const calculatedPrice = isAuto ? Math.round(basePrice * qVal * 100) / 100 : Number(v.price) || 0;
      const calculatedComparePrice = isAuto && compareBasePrice
        ? Math.round(compareBasePrice * qVal * 100) / 100
        : (v.compare_price != null && v.compare_price > 0 ? Number(v.compare_price) : null);

      const variantData = {
        label: v.label.trim(),
        price: calculatedPrice,
        compare_price: calculatedComparePrice,
        quantity_value: qVal,
        is_auto_priced: isAuto,
        stock_quantity: v.stock_quantity,
        sku: v.sku?.trim() || null,
        sort_order: v.sort_order,
        is_available: true,
      };

      if (v.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("product_variants")
          .update(variantData)
          .eq("id", v.id);
      } else {
        // Insert new variant
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("product_variants").insert({
          ...variantData,
          product_id: payload.id,
        });
      }
    }

    // Revalidate paths for instant cache refresh
    revalidatePath("/admin/products");
    revalidatePath(`/products/${payload.slug}`);
    revalidatePath("/categories");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    console.error("updateProduct exception:", err);
    return { success: false, error: err.message || "Failed to update product" };
  }
}

export async function searchProductsLiveAction(
  searchTerm: string,
  categorySlug: string = "all"
) {
  try {
    const term = searchTerm.trim();
    if (!term || term.length < 1) return [];

    const supabase = await createClient();
    const cleanTerm = term.replace(/[%_,()"]/g, "").trim();
    if (!cleanTerm) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("products")
      .select(`
        id, name, slug, description, image_url,
        categories:category_id!inner(id, name, slug, gst_enabled, gst_percentage, is_active),
        product_variants(id, label, price, stock_quantity, is_available)
      `)
      .eq("is_active", true)
      .eq("categories.is_active", true)
      .ilike("name", `%${cleanTerm}%`)
      .limit(8);

    if (categorySlug && categorySlug !== "all") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: cat } = await (supabase as any)
        .from("categories")
        .select("id, is_active")
        .eq("slug", categorySlug)
        .eq("is_active", true)
        .maybeSingle();

      if (!cat) return [];
      query = query.eq("category_id", cat.id);
    }

    const { data, error } = await query;
    if (error) {
      console.error("searchProductsLiveAction query error:", error);
      return [];
    }

    return (data || []).filter(
      (p: any) => p.is_active === true && p.categories?.is_active === true
    );
  } catch (err: any) {
    console.error("searchProductsLiveAction exception:", err);
    return [];
  }
}

export async function toggleCategoryActiveAction(id: string, current: boolean) {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("categories")
      .update({ is_active: !current })
      .eq("id", id);

    if (error) {
      console.error("Error toggling category status:", error);
      return { success: false, error: error.message };
    }

    // Revalidate paths across storefront and admin
    revalidatePath("/", "layout");
    revalidatePath("/categories");
    revalidatePath("/products");
    revalidatePath("/admin/categories");

    return { success: true };
  } catch (err: any) {
    console.error("toggleCategoryActiveAction exception:", err);
    return { success: false, error: err.message || "Failed to toggle category" };
  }
}

