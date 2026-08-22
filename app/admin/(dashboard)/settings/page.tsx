import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";

export const metadata: Metadata = { title: "Settings — Admin" };

const SETTING_LABELS: Record<string, { label: string; type?: string }> = {
  hero_headline_line1: { label: "Hero Headline Line 1" },
  hero_headline_line2: { label: "Hero Headline Line 2" },
  hero_description: { label: "Hero Description" },
  hero_image_url: { label: "Hero Image URL" },
  brand_name: { label: "Brand Name" },
  tagline: { label: "Tagline" },
  contact_phone: { label: "Contact Phone", type: "tel" },
  contact_email: { label: "Contact Email", type: "email" },
  contact_address: { label: "Contact Address" },
  delivery_message: { label: "Announcement Bar Message" },
  same_day_cutoff_time: { label: "Same-Day Delivery Cutoff Time" },
  same_day_message: { label: "Same-Day Delivery Message" },
  delivery_fee: { label: "Delivery Fee (₹)", type: "number" },
  free_delivery_above: { label: "Free Delivery Above (₹)", type: "number" },
  instagram_url: { label: "Instagram URL", type: "url" },
  facebook_url: { label: "Facebook URL", type: "url" },
  whatsapp_number: { label: "WhatsApp Number", type: "tel" },
  footer_tagline: { label: "Footer Tagline" },
};

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: settings } = await (supabase as any)
    .from("site_settings")
    .select("key, value");

  const settingsMap: Record<string, string> = {};
  settings?.forEach(({ key, value }: { key: string; value: string | null }) => {
    settingsMap[key] = value ?? "";
  });

  const settingsWithLabels = Object.entries(SETTING_LABELS).map(([key, { label, type }]) => ({
    key,
    label,
    type: type ?? "text",
    value: settingsMap[key] ?? "",
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Store Settings & Content</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Update your homepage hero banner, branding, logistics rules, and contact info
        </p>
      </div>
      <AdminSettingsClient settings={settingsWithLabels} />
    </div>
  );
}
