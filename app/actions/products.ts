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
  variants: {
    id?: string;
    label: string;
    price: number;
    stock_quantity: number;
    sku: string | null;
    sort_order: number;
  }[];
}

export async function updateProduct(payload: UpdateProductPayload) {
  try {
    const supabase = await createClient();

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

    // Update existing variants
    for (const v of payload.variants) {
      if (v.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("product_variants")
          .update({
            label: v.label.trim(),
            price: v.price,
            stock_quantity: v.stock_quantity,
            sku: v.sku?.trim() || null,
            sort_order: v.sort_order,
            is_available: true,
          })
          .eq("id", v.id);
      } else {
        // Insert new variant
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("product_variants").insert({
          product_id: payload.id,
          label: v.label.trim(),
          price: v.price,
          stock_quantity: v.stock_quantity,
          sku: v.sku?.trim() || null,
          sort_order: v.sort_order,
          is_available: true,
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
