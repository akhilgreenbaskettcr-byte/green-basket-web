import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { EditProductForm } from "@/components/admin/EditProductForm";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Edit Product — Admin" };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Try finding by slug first, or by id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { data: product } = await (supabase as any)
    .from("products")
    .select(`*, product_variants(*)`)
    .eq("slug", id)
    .maybeSingle();

  if (!product) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: byId } = await (supabase as any)
      .from("products")
      .select(`*, product_variants(*)`)
      .eq("id", id)
      .maybeSingle();
    product = byId;
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("sort_order");

  if (!product) notFound();

  return (
    <div>
      <EditProductForm product={product} categories={categories ?? []} />
    </div>
  );
}
