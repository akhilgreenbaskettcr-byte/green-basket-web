/**
 * Type-safe Supabase query helpers
 * 
 * Since the publishable key format differs from JWT anon keys,
 * we use explicit type assertions in our query functions.
 */
import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import type {
  Category,
  Product,
  ProductWithVariants,
  SiteSettings,
  Order,
  ProductVariant,
} from "@/types/database";

// ============================================================
// SITE SETTINGS
// ============================================================
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("site_settings")
      .select("key, value");

    if (error || !data) return {};
    return Object.fromEntries(
      (data as { key: string; value: string | null }[]).map(({ key, value }) => [key, value ?? ""])
    );
  } catch (err) {
    console.error("Exception fetching site settings:", err);
    return {};
  }
});

// ============================================================
// CATEGORIES
// ============================================================
export const getActiveCategories = cache(async (): Promise<Category[]> => {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("categories")
      .select("id, name, slug, description, image_url, sort_order, is_active, created_at, updated_at")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
    return (data as Category[]) ?? [];
  } catch (err) {
    console.error("Exception fetching categories:", err);
    return [];
  }
});

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) return null;
    return (data as Category) ?? null;
  } catch (err) {
    console.error("Exception fetching category by slug:", err);
    return null;
  }
}

// ============================================================
// PRODUCTS
// ============================================================
export const getAllActiveProducts = cache(async (): Promise<ProductWithVariants[]> => {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("products")
      .select(`
        id, category_id, name, slug, description, image_url,
        is_active, is_featured, sort_order, benefits, ingredients,
        storage_info, created_at, updated_at,
        categories:category_id(id, name, slug),
        product_variants(
          id, product_id, label, price, compare_price, sku,
          stock_quantity, is_available, sort_order, created_at, updated_at
        )
      `)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching all products:", error);
      return [];
    }
    return (data as ProductWithVariants[]) ?? [];
  } catch (err) {
    console.error("Exception fetching all products:", err);
    return [];
  }
});

export async function getProductsByCategory(categoryId: string): Promise<ProductWithVariants[]> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("products")
      .select(`
        id, category_id, name, slug, description, image_url,
        is_active, is_featured, sort_order, benefits, ingredients,
        storage_info, created_at, updated_at,
        categories:category_id(id, name, slug),
        product_variants(
          id, product_id, label, price, compare_price, sku,
          stock_quantity, is_available, sort_order, created_at, updated_at
        )
      `)
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching products by category:", error);
      return [];
    }
    return (data as ProductWithVariants[]) ?? [];
  } catch (err) {
    console.error("Exception fetching products by category:", err);
    return [];
  }
}

export async function getFeaturedProducts(): Promise<ProductWithVariants[]> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("products")
      .select(`
        id, category_id, name, slug, description, image_url,
        is_active, is_featured, sort_order, benefits, ingredients,
        storage_info, created_at, updated_at,
        categories:category_id(id, name, slug),
        product_variants(
          id, product_id, label, price, compare_price, sku,
          stock_quantity, is_available, sort_order, created_at, updated_at
        )
      `)
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("sort_order", { ascending: true })
      .limit(8);

    if (error) {
      console.error("Error fetching featured products:", error);
      return [];
    }
    return (data as ProductWithVariants[]) ?? [];
  } catch (err) {
    console.error("Exception fetching featured products:", err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<ProductWithVariants | null> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("products")
      .select(`
        id, category_id, name, slug, description, image_url,
        is_active, is_featured, sort_order, benefits, ingredients,
        storage_info, created_at, updated_at,
        categories:category_id(id, name, slug),
        product_variants(
          id, product_id, label, price, compare_price, sku,
          stock_quantity, is_available, sort_order, created_at, updated_at
        )
      `)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) return null;
    return data as ProductWithVariants;
  } catch (err) {
    console.error("Exception fetching product by slug:", err);
    return null;
  }
}

export async function searchProducts(query: string): Promise<ProductWithVariants[]> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("products")
      .select(`
        id, category_id, name, slug, description, image_url,
        is_active, is_featured, sort_order, benefits, ingredients,
        storage_info, created_at, updated_at,
        categories:category_id(id, name, slug),
        product_variants(
          id, product_id, label, price, compare_price, sku,
          stock_quantity, is_available, sort_order, created_at, updated_at
        )
      `)
      .eq("is_active", true)
      .ilike("name", `%${query}%`)
      .limit(12);

    if (error) return [];
    return (data as ProductWithVariants[]) ?? [];
  } catch (err) {
    console.error("Exception searching products:", err);
    return [];
  }
}

// ============================================================
// ADMIN
// ============================================================
export async function getAllCategoriesAdmin(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) return [];
    return (data as Category[]) ?? [];
  } catch (err) {
    console.error("Exception in getAllCategoriesAdmin:", err);
    return [];
  }
}

export async function getAllProductsAdmin(): Promise<ProductWithVariants[]> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("products")
      .select(`
        *,
        categories:category_id(id, name, slug),
        product_variants(*)
      `)
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data as ProductWithVariants[]) ?? [];
  } catch (err) {
    console.error("Exception in getAllProductsAdmin:", err);
    return [];
  }
}

// Get lowest price from variants
export function getLowestPrice(
  variants: { price: number; is_available: boolean }[]
): number | null {
  const available = variants.filter((v) => v.is_available);
  if (!available.length) return null;
  return Math.min(...available.map((v) => v.price));
}
