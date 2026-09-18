import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AdminProductsClient, type AdminProduct } from "@/components/admin/AdminProductsClient";

export const metadata: Metadata = { title: "Products — Admin" };

export default async function AdminProductsPage() {
  const supabase = await createClient();

  // Admin-only page: redirect staff to orders
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/admin/orders");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: products } = await (supabase as any)
    .from("products")
    .select(`
      id, name, slug, image_url, is_active, is_featured, updated_at,
      categories:category_id(name),
      product_variants(id, label, price, stock_quantity, is_available)
    `)
    .order("created_at", { ascending: false }) as { data: AdminProduct[] | null };

  return <AdminProductsClient products={products || []} />;
}
