"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function saveSiteSettings(settings: Record<string, string>) {
  try {
    const supabase = await createClient();

    const upserts = Object.entries(settings).map(([key, value]) => ({
      key,
      value: value ?? "",
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("site_settings")
      .upsert(upserts, { onConflict: "key" });

    if (error) {
      return { success: false, error: error.message };
    }

    // Force revalidate all public pages so changes show immediately
    revalidatePath("/", "page");
    revalidatePath("/categories", "page");
    revalidatePath("/about", "page");
    revalidatePath("/contact", "page");
    revalidatePath("/how-it-works", "page");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save settings" };
  }
}
