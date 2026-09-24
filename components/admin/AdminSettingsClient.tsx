"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  Loader2,
  Check,
  LayoutTemplate,
  Store,
  Truck,
  PhoneCall,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Setting {
  key: string;
  label: string;
  type: string;
  value: string;
}

interface AdminSettingsClientProps {
  settings: Setting[];
}

const TABS = [
  { id: "hero", label: "Hero & Homepage", icon: LayoutTemplate },
  { id: "branding", label: "Branding & Store", icon: Store },
  { id: "delivery", label: "Delivery & Ordering", icon: Truck },
  { id: "contact", label: "Contact & Social", icon: PhoneCall },
  { id: "security", label: "Security", icon: ShieldCheck },
];

export function AdminSettingsClient({ settings }: AdminSettingsClientProps) {
  const [activeTab, setActiveTab] = useState("hero");
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {
      hero_headline_line1: "Fresh ingredients.",
      hero_headline_line2: "Made simple.",
      hero_description:
        "From freshly cut vegetables to aromatic powders and pure oils — everything your kitchen needs, made easy.",
      hero_image_url: "/images/hero-vegetables.jpg",
      delivery_fee: "40",
      free_delivery_above: "0",
      same_day_cutoff_time: "1:00 PM",
      same_day_message: "Order before 1PM for same day delivery.",
      enable_cod: "true",
      footer_delivery_title: "SAME DAY DELIVERY",
      footer_delivery_desc: "Order before 1:00 PM",
      footer_order_cutoff_text: "Same-Day delivery for orders before 1:00 PM",
    };
    settings.forEach(({ key, value }) => {
      if (value !== undefined && value !== null) initial[key] = value;
    });
    return initial;
  });

  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Change Password state
  const [pwForm, setPwForm] = useState({ newPassword: "", confirmPassword: "" });
  const [pwShowNew, setPwShowNew] = useState(false);
  const [pwShowConfirm, setPwShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (pwForm.newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }

    setPwLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: pwForm.newPassword,
    });
    setPwLoading(false);

    if (updateError) {
      setPwError(updateError.message || "Failed to update password.");
    } else {
      setPwSuccess("Admin password updated successfully!");
      setPwForm({ newPassword: "", confirmPassword: "" });
    }
  };

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    startTransition(async () => {
      const supabase = createClient();

      const upserts = Object.entries(values).map(([key, value]) => ({
        key,
        value: value ?? "",
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any)
        .from("site_settings")
        .upsert(upserts, { onConflict: "key" });

      if (dbError) {
        setError(dbError.message);
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  };

  return (
    <>
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {/* Tabs navigation */}
      <div className="flex border-b border-gray-200 bg-white rounded-2xl p-1.5 shadow-sm overflow-x-auto gap-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0",
              activeTab === id
                ? "bg-gb-green text-white shadow-sm"
                : "text-gray-600 hover:text-gb-charcoal hover:bg-gray-50"
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab 1: Hero & Homepage */}
      {activeTab === "hero" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gb-charcoal">
              Homepage Hero Banner
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload the main hero photograph and configure the headline shown to visitors.
            </p>
          </div>

          <div className="space-y-4">
            <ImageUpload
              label="Hero Image / Visual Banner"
              value={values["hero_image_url"] || "/images/hero-vegetables.jpg"}
              onChange={(url) => handleChange("hero_image_url", url)}
              bucket="site-assets"
              helperText="Upload the high-res hero image (4:3 aspect ratio recommended)"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="gb-label">Headline Line 1</label>
                <input
                  type="text"
                  value={values["hero_headline_line1"] || ""}
                  onChange={(e) => handleChange("hero_headline_line1", e.target.value)}
                  placeholder="Fresh ingredients."
                  className="gb-input"
                />
              </div>
              <div>
                <label className="gb-label">Headline Line 2 (Green Accent)</label>
                <input
                  type="text"
                  value={values["hero_headline_line2"] || ""}
                  onChange={(e) => handleChange("hero_headline_line2", e.target.value)}
                  placeholder="Made simple."
                  className="gb-input"
                />
              </div>
            </div>

            <div>
              <label className="gb-label">Hero Description Subtext</label>
              <textarea
                value={values["hero_description"] || ""}
                onChange={(e) => handleChange("hero_description", e.target.value)}
                placeholder="From freshly cut vegetables to aromatic powders..."
                rows={3}
                className="gb-input resize-none"
              />
            </div>

            <div>
              <label className="gb-label">Announcement Bar Banner Message</label>
              <input
                type="text"
                value={values["delivery_message"] || ""}
                onChange={(e) => handleChange("delivery_message", e.target.value)}
                placeholder="Freshly cut. Hygienically packed. Delivered to your doorstep."
                className="gb-input"
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <ImageUpload
                label="Farm-to-Door Freshness Banner Image"
                value={values["freshness_banner_image"] || ""}
                onChange={(url) => handleChange("freshness_banner_image", url)}
                bucket="site-assets"
                helperText="Upload transparent PNG or photo of your fresh vegetable basket (shows on the homepage Freshness Promise card)"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Branding & Store */}
      {activeTab === "branding" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gb-charcoal">
              Branding & Identity
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Set brand name, slogan, and descriptive footer summary.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="gb-label">Brand Name</label>
                <input
                  type="text"
                  value={values["brand_name"] || ""}
                  onChange={(e) => handleChange("brand_name", e.target.value)}
                  placeholder="Green Basket"
                  className="gb-input"
                />
              </div>
              <div>
                <label className="gb-label">Brand Tagline</label>
                <input
                  type="text"
                  value={values["tagline"] || ""}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  placeholder="Your Kitchen, Simplified"
                  className="gb-input"
                />
              </div>
            </div>

            <div>
              <label className="gb-label">Footer Brand Slogan</label>
              <textarea
                value={values["footer_tagline"] || ""}
                onChange={(e) => handleChange("footer_tagline", e.target.value)}
                rows={3}
                placeholder="From freshly cut vegetables to aromatic powders and pure oils..."
                className="gb-input resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Delivery & Logistics */}
      {activeTab === "delivery" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gb-charcoal">
              Delivery & Order Rules
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure cutoff times for same-day delivery and delivery fees.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="gb-label">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={values["delivery_fee"] ?? ""}
                onChange={(e) => handleChange("delivery_fee", e.target.value)}
                placeholder="0"
                className="gb-input"
              />
            </div>
            <div>
              <label className="gb-label">Free Delivery Threshold (₹)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={values["free_delivery_above"] ?? ""}
                onChange={(e) => handleChange("free_delivery_above", e.target.value)}
                placeholder="0 for none"
                className="gb-input"
              />
            </div>
            <div>
              <label className="gb-label">Same-Day Cutoff Time</label>
              <input
                type="text"
                value={values["same_day_cutoff_time"] ?? ""}
                onChange={(e) => handleChange("same_day_cutoff_time", e.target.value)}
                placeholder="1:00 PM"
                className="gb-input"
              />
            </div>
            <div>
              <label className="gb-label">Delivery Notice Message</label>
              <input
                type="text"
                value={values["same_day_message"] ?? ""}
                onChange={(e) => handleChange("same_day_message", e.target.value)}
                placeholder="Order before 1PM for same day delivery."
                className="gb-input"
              />
            </div>
            <div>
              <label className="gb-label">Footer Delivery Title</label>
              <input
                type="text"
                value={values["footer_delivery_title"] ?? ""}
                onChange={(e) => handleChange("footer_delivery_title", e.target.value)}
                placeholder="SAME DAY DELIVERY"
                className="gb-input uppercase font-bold"
              />
            </div>
            <div>
              <label className="gb-label">Footer Delivery Subtext</label>
              <input
                type="text"
                value={values["footer_delivery_desc"] ?? ""}
                onChange={(e) => handleChange("footer_delivery_desc", e.target.value)}
                placeholder="Order before 1:00 PM"
                className="gb-input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="gb-label">Footer Kitchen Concierge Cutoff Notice</label>
              <input
                type="text"
                value={values["footer_order_cutoff_text"] ?? ""}
                onChange={(e) => handleChange("footer_order_cutoff_text", e.target.value)}
                placeholder="Same-Day delivery for orders before 1:00 PM"
                className="gb-input"
              />
            </div>

            {/* Cash on Delivery (COD) Switch */}
            <div className="sm:col-span-2 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <label className="text-sm font-bold text-gb-charcoal block">
                  Enable Cash on Delivery (COD)
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  Allow customers to pay with cash at their doorstep upon delivery.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={values["enable_cod"] !== "false"}
                  onChange={(e) =>
                    handleChange("enable_cod", e.target.checked ? "true" : "false")
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gb-green"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Contact & Social */}
      {activeTab === "contact" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gb-charcoal">
              Contact & Social Channels
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Customer support lines and social media profiles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="gb-label">Customer Support Phone</label>
              <input
                type="tel"
                value={values["contact_phone"] || ""}
                onChange={(e) => handleChange("contact_phone", e.target.value)}
                placeholder="+91 90481 78886"
                className="gb-input"
              />
            </div>
            <div>
              <label className="gb-label">WhatsApp Contact Number</label>
              <input
                type="tel"
                value={values["whatsapp_number"] || ""}
                onChange={(e) => handleChange("whatsapp_number", e.target.value)}
                placeholder="+919048178886"
                className="gb-input"
              />
            </div>
            <div>
              <label className="gb-label">Support Email Address</label>
              <input
                type="email"
                value={values["contact_email"] || ""}
                onChange={(e) => handleChange("contact_email", e.target.value)}
                placeholder="info@greenbaskettcr.com"
                className="gb-input"
              />
            </div>
            <div>
              <label className="gb-label">Official Store Address</label>
              <input
                type="text"
                value={values["contact_address"] || ""}
                onChange={(e) => handleChange("contact_address", e.target.value)}
                placeholder="Green Basket Tcr, Near Ayyanthole Ground, Thrissur, Kerala - 680003."
                className="gb-input"
              />
            </div>
            <div>
              <label className="gb-label">Instagram Profile URL</label>
              <input
                type="url"
                value={values["instagram_url"] || ""}
                onChange={(e) => handleChange("instagram_url", e.target.value)}
                placeholder="https://www.instagram.com/greenbaskettcr?igsi=MWR2aGZja3Z0dXB6OA=="
                className="gb-input"
              />
            </div>
            <div>
              <label className="gb-label">Facebook Profile URL</label>
              <input
                type="url"
                value={values["facebook_url"] || ""}
                onChange={(e) => handleChange("facebook_url", e.target.value)}
                placeholder="https://www.facebook.com/share/1D6LKpc5Rx/"
                className="gb-input"
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4" role="alert">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Actions — only show when not on security tab */}
      {activeTab !== "security" && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-gray-500">
            {saved && (
              <span className="inline-flex items-center gap-1 text-green-700 font-medium">
                <Check size={14} /> Changes saved successfully!
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary shadow-md hover:shadow-lg transition-all"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save size={16} />
                Save All Settings
              </>
            )}
          </button>
        </div>
      )}
    </form>

    {/* Security Tab — Change Admin Password (outside form, uses its own submit) */}
    {activeTab === "security" && (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 max-w-md">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-gb-green flex items-center justify-center">
            <KeyRound size={16} />
          </div>
          <h2 className="text-base font-bold text-gray-900">Change Admin Password</h2>
        </div>
        <p className="text-xs text-gray-500 mb-6">
          Update the password for this admin account. Takes effect on next login.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="gb-label text-xs">New Password</label>
            <div className="relative">
              <input
                type={pwShowNew ? "text" : "password"}
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                placeholder="Min. 8 characters"
                className="gb-input text-sm pr-10"
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setPwShowNew(!pwShowNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label={pwShowNew ? "Hide password" : "Show password"}
              >
                {pwShowNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="gb-label text-xs">Confirm New Password</label>
            <div className="relative">
              <input
                type={pwShowConfirm ? "text" : "password"}
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
                className="gb-input text-sm pr-10"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setPwShowConfirm(!pwShowConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label={pwShowConfirm ? "Hide password" : "Show password"}
              >
                {pwShowConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Feedback */}
          {pwError && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-200">
              <AlertCircle size={14} className="shrink-0" />
              {pwError}
            </div>
          )}
          {pwSuccess && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs p-3 rounded-xl border border-emerald-200">
              <Check size={14} className="shrink-0" />
              {pwSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={pwLoading}
            className="btn-primary w-full justify-center py-2.5 shadow-md"
          >
            {pwLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Updating Password…
              </>
            ) : (
              <>
                <KeyRound size={15} /> Update Admin Password
              </>
            )}
          </button>
        </form>
      </div>
    )}
    </>
  );
}
