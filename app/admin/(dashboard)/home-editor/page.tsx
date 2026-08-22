import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { HomeEditorClient } from "@/components/admin/HomeEditorClient";

export const metadata: Metadata = { title: "Home Page Editor — Admin" };

export default async function HomeEditorPage() {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: settings } = await (supabase as any)
    .from("site_settings")
    .select("key, value");

  const settingsMap: Record<string, string> = {};
  settings?.forEach(({ key, value }: { key: string; value: string | null }) => {
    settingsMap[key] = value ?? "";
  });

  return <HomeEditorClient initialSettings={settingsMap} />;
}
