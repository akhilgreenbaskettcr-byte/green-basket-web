import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { NewProductForm } from "@/components/admin/NewProductForm";

export const metadata: Metadata = { title: "New Product — Admin" };

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("sort_order");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Add New Product</h1>
      <NewProductForm categories={categories ?? []} />
    </div>
  );
}
