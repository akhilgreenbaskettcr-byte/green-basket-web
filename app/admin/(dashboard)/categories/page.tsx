import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { AdminCategoriesClient } from "@/components/admin/AdminCategoriesClient";
import type { Category } from "@/types/database";

export const metadata: Metadata = { title: "Categories — Admin" };

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: categories } = await (supabase as any)
    .from("categories")
    .select("*")
    .order("sort_order") as { data: Category[] | null };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">{categories?.length ?? 0} categories</p>
        </div>
      </div>
      <AdminCategoriesClient categories={categories ?? []} />
    </div>
  );
}
