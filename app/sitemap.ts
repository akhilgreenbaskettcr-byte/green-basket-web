import type { MetadataRoute } from "next";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Always use the official production domain in production/Search Console
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL;
  const BASE_URL =
    rawUrl && !rawUrl.includes("localhost")
      ? rawUrl.replace(/\/$/, "")
      : "https://www.greenbaskettcr.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/categories`, lastModified: new Date(), changeFrequency: "daily", priority: 0.95 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/how-it-works`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE_URL}/shipping-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/refund-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/cancellation-refund-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/terms-and-conditions`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/terms-of-service`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  let categoryPages: MetadataRoute.Sitemap = [];
  let productPages: MetadataRoute.Sitemap = [];

  try {
    const supabase = await createClient();
    const [{ data: categories }, { data: products }] = await Promise.all([
      supabase.from("categories").select("slug, updated_at").eq("is_active", true),
      supabase.from("products").select("slug, updated_at").eq("is_active", true),
    ]);

    if (categories && categories.length > 0) {
      categoryPages = categories.map((cat) => ({
        url: `${BASE_URL}/categories/${cat.slug}`,
        lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      }));
    }

    if (products && products.length > 0) {
      productPages = products.map((p) => ({
        url: `${BASE_URL}/products/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: "daily",
        priority: 0.85,
      }));
    }
  } catch (err) {
    console.warn("[Sitemap] Error fetching dynamic sitemap items:", err);
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
