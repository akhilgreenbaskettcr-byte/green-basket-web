"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { saveSiteSettings } from "@/app/actions/settings";
import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  Save,
  Loader2,
  Check,
  Eye,
  LayoutTemplate,
  Bell,
  Leaf,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  HeartHandshake,
  Workflow,
} from "lucide-react";

interface HomeEditorClientProps {
  initialSettings: Record<string, string>;
}

export function HomeEditorClient({ initialSettings }: HomeEditorClientProps) {
  const hasDbHeroImage = "hero_image_url" in initialSettings;
  const initialHeroImage = hasDbHeroImage
    ? initialSettings["hero_image_url"]
    : "https://res.cloudinary.com/pjgmmeb8/image/upload/v1787394877/green-basket/hero/hero_vegetables_main.jpg";

  const initialDeliveryBanner = initialSettings["delivery_banner_image_url"] ?? "";

  const [values, setValues] = useState<Record<string, string>>({
    hero_headline_line1: initialSettings["hero_headline_line1"] ?? "Fresh ingredients.",
    hero_headline_line2: initialSettings["hero_headline_line2"] ?? "Made simple.",
    hero_description:
      initialSettings["hero_description"] ??
      "From freshly cut vegetables to aromatic powders and pure oils — everything your kitchen needs, made easy.",
    hero_image_url: initialHeroImage,
    hero_image_url_2: initialSettings["hero_image_url_2"] ?? "",
    hero_image_url_3: initialSettings["hero_image_url_3"] ?? "",
    delivery_message:
      initialSettings["delivery_message"] ??
      "Freshly cut. Hygienically packed. Delivered to your doorstep.",
    same_day_cutoff_time:
      initialSettings["same_day_cutoff_time"] ?? "1:00 PM",
    same_day_message:
      initialSettings["same_day_message"] ??
      "Order before 1PM for next day delivery.",
    delivery_banner_tag:
      initialSettings["delivery_banner_tag"] ?? "NEXT DAY DELIVERY",
    delivery_banner_headline:
      initialSettings["delivery_banner_headline"] ?? "Order before 1:00 PM,\nfor next day delivery.",
    delivery_banner_description:
      initialSettings["delivery_banner_description"] ??
      "Freshly cut, hygienically packed, and delivered straight to your kitchen — next day fresh.",
    delivery_banner_btn_text:
      initialSettings["delivery_banner_btn_text"] ?? "Start Shopping",
    delivery_banner_btn_url:
      initialSettings["delivery_banner_btn_url"] ?? "/categories",
    delivery_banner_image_url: initialDeliveryBanner,
    freshness_banner_image:
      initialSettings["freshness_banner_image"] ||
      initialSettings["farm_to_door_image_url"] ||
      "",
    farm_to_door_image_url:
      initialSettings["farm_to_door_image_url"] ||
      initialSettings["freshness_banner_image"] ||
      "",
    why_card_1_image: initialSettings["why_card_1_image"] ?? "",
    why_card_2_image: initialSettings["why_card_2_image"] ?? "",
    why_card_3_image: initialSettings["why_card_3_image"] ?? "",
    why_card_4_image: initialSettings["why_card_4_image"] ?? "",
    step_1_image: initialSettings["step_1_image"] ?? "",
    step_2_image: initialSettings["step_2_image"] ?? "",
    step_3_image: initialSettings["step_3_image"] ?? "",
    step_4_image: initialSettings["step_4_image"] ?? "",
  });

  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    startTransition(async () => {
      const res = await saveSiteSettings(values);
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3500);
      } else {
        setError(res.error || "Failed to save homepage settings");
      }
    });
  };

  const activeHeroCount = [
    values["hero_image_url"],
    values["hero_image_url_2"],
    values["hero_image_url_3"],
  ].filter(Boolean).length;

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-6xl">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutTemplate className="text-gb-green" size={24} />
            Home Page Editor
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Customize multi-image hero slider, "Why Choose Us" illustrations, "How It Works" step icons, same-day banner, and announcements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3.5 py-2.5 rounded-xl transition-colors"
          >
            <Eye size={14} /> Preview Store <ExternalLink size={12} />
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary flex items-center gap-1.5 text-xs px-6 py-2.5 shadow-sm cursor-pointer"
            id="save-home-editor-btn"
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Publishing Changes…
              </>
            ) : (
              <>
                <Save size={15} />
                Publish Changes
              </>
            )}
          </button>
        </div>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 text-sm font-medium shadow-xs">
          <Check size={18} className="text-emerald-600 shrink-0" />
          <span>
            Homepage updated successfully! Click{" "}
            <Link href="/" target="_blank" className="underline font-bold">
              here to view your updated storefront
            </Link>
            .
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Editor Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Hero Multi-Image Slider */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Leaf size={18} className="text-gb-green" />
                <h2 className="text-base font-bold text-gray-900">
                  1. Hero Banner Photography (Up to 3 Images)
                </h2>
              </div>
              <span className="text-xs font-bold text-gb-green bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                {activeHeroCount} {activeHeroCount === 1 ? "Image Active" : "Images Active (Auto-Sliding)"}
              </span>
            </div>

            <div className="space-y-5">
              {/* Slide 1 */}
              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-gb-green text-white flex items-center justify-center text-[10px]">1</span>
                    Hero Slide 1 (Primary Image)
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">Always Required</span>
                </div>
                <ImageUpload
                  label=""
                  value={values["hero_image_url"]}
                  onChange={(url) => handleChange("hero_image_url", url)}
                  folder="hero"
                  helperText="Primary vegetable platter / grocery photography (white background blends 100%)."
                />
              </div>

              {/* Slide 2 */}
              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-gray-400 text-white flex items-center justify-center text-[10px]">2</span>
                    Hero Slide 2 (Optional)
                  </span>
                  {values["hero_image_url_2"] && (
                    <button
                      type="button"
                      onClick={() => handleChange("hero_image_url_2", "")}
                      className="text-[11px] text-red-600 hover:underline font-semibold"
                    >
                      Clear Image 2
                    </button>
                  )}
                </div>
                <ImageUpload
                  label=""
                  value={values["hero_image_url_2"]}
                  onChange={(url) => handleChange("hero_image_url_2", url)}
                  folder="hero"
                  helperText="Optional second image. Uploading this enables smooth automatic slide transitions."
                />
              </div>

              {/* Slide 3 */}
              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-gray-400 text-white flex items-center justify-center text-[10px]">3</span>
                    Hero Slide 3 (Optional)
                  </span>
                  {values["hero_image_url_3"] && (
                    <button
                      type="button"
                      onClick={() => handleChange("hero_image_url_3", "")}
                      className="text-[11px] text-red-600 hover:underline font-semibold"
                    >
                      Clear Image 3
                    </button>
                  )}
                </div>
                <ImageUpload
                  label=""
                  value={values["hero_image_url_3"]}
                  onChange={(url) => handleChange("hero_image_url_3", url)}
                  folder="hero"
                  helperText="Optional third image. Seamlessly transitions in sequence every 4.5 seconds."
                />
              </div>

              {/* Headlines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="gb-label">Headline (Line 1)</label>
                  <input
                    type="text"
                    value={values["hero_headline_line1"]}
                    onChange={(e) => handleChange("hero_headline_line1", e.target.value)}
                    placeholder="Fresh ingredients."
                    className="gb-input font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="gb-label">Headline (Line 2 — Accent)</label>
                  <input
                    type="text"
                    value={values["hero_headline_line2"]}
                    onChange={(e) => handleChange("hero_headline_line2", e.target.value)}
                    placeholder="Made simple."
                    className="gb-input font-bold text-gb-green"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="gb-label">Hero Description Text</label>
                <textarea
                  value={values["hero_description"]}
                  onChange={(e) => handleChange("hero_description", e.target.value)}
                  rows={3}
                  placeholder="From freshly cut vegetables to aromatic powders and pure oils..."
                  className="gb-input resize-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Farm-to-Door Freshness Banner Image */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Leaf size={18} className="text-gb-green" />
              <h2 className="text-base font-bold text-gray-900">
                2. Farm-to-Door Freshness Banner (Full Artwork Image)
              </h2>
            </div>
            <p className="text-xs text-gray-500">
              Upload your campaign banner image (the wide graphic with fresh harvest basket and farm badge). This covers the entire Farm-to-Door promise section on the homepage.
            </p>
            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200/70 space-y-2">
              <ImageUpload
                label="Farm-to-Door Artwork Banner Image"
                value={values["freshness_banner_image"] || values["farm_to_door_image_url"] || ""}
                onChange={(url) => {
                  handleChange("freshness_banner_image", url);
                  handleChange("farm_to_door_image_url", url);
                }}
                folder="banners"
                helperText="Upload wide high-resolution campaign banner (PNG, WebP, JPG)."
              />
            </div>
          </div>

          {/* Section 3: Why Choose Us — 4 Card Illustration Images */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <HeartHandshake size={18} className="text-gb-green" />
              <h2 className="text-base font-bold text-gray-900">
                3. "Why Choose Us" Card Bottom Illustrations (4 Slots)
              </h2>
            </div>
            <p className="text-xs text-gray-500">
              Upload matching bottom images for each of the 4 "Why Choose Us" feature cards.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Card 1 */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                <span className="text-xs font-bold text-gray-800">Card 1: Farm Fresh Quality</span>
                <ImageUpload
                  label=""
                  value={values["why_card_1_image"]}
                  onChange={(url) => handleChange("why_card_1_image", url)}
                  folder="why-us"
                  helperText="e.g. Fresh spinach and yellow bell pepper"
                />
              </div>

              {/* Card 2 */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                <span className="text-xs font-bold text-gray-800">Card 2: Clean & Safe Products</span>
                <ImageUpload
                  label=""
                  value={values["why_card_2_image"]}
                  onChange={(url) => handleChange("why_card_2_image", url)}
                  folder="why-us"
                  helperText="e.g. Fresh broccoli, tomatoes & mushroom"
                />
              </div>

              {/* Card 3 */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                <span className="text-xs font-bold text-gray-800">Card 3: Convenient & Reliable</span>
                <ImageUpload
                  label=""
                  value={values["why_card_3_image"]}
                  onChange={(url) => handleChange("why_card_3_image", url)}
                  folder="why-us"
                  helperText="e.g. Green Basket grocery bag with vegetables"
                />
              </div>

              {/* Card 4 */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                <span className="text-xs font-bold text-gray-800">Card 4: Naturally Better</span>
                <ImageUpload
                  label=""
                  value={values["why_card_4_image"]}
                  onChange={(url) => handleChange("why_card_4_image", url)}
                  folder="why-us"
                  helperText="e.g. Split fresh coconuts with leaves"
                />
              </div>
            </div>
          </div>

          {/* Section 4: How It Works — Step Node Icons / Illustrations */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Workflow size={18} className="text-gb-green" />
              <h2 className="text-base font-bold text-gray-900">
                4. "How It Works" Step Icons / Illustrations (4 Slots)
              </h2>
            </div>
            <p className="text-xs text-gray-500">
              Upload custom vector icons or illustrations for each circular step node.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Step 1 */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                <span className="text-xs font-bold text-gray-800">Step 01: Browse Products</span>
                <ImageUpload
                  label=""
                  value={values["step_1_image"]}
                  onChange={(url) => handleChange("step_1_image", url)}
                  folder="how-it-works"
                  helperText="e.g. Fresh produce basket / storefront icon"
                />
              </div>

              {/* Step 2 */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                <span className="text-xs font-bold text-gray-800">Step 02: Place Your Order</span>
                <ImageUpload
                  label=""
                  value={values["step_2_image"]}
                  onChange={(url) => handleChange("step_2_image", url)}
                  folder="how-it-works"
                  helperText="e.g. Clipboard order checklist icon"
                />
              </div>

              {/* Step 3 */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                <span className="text-xs font-bold text-gray-800">Step 03: We Prepare Fresh</span>
                <ImageUpload
                  label=""
                  value={values["step_3_image"]}
                  onChange={(url) => handleChange("step_3_image", url)}
                  folder="how-it-works"
                  helperText="e.g. Fresh prep / eco van icon"
                />
              </div>

              {/* Step 4 */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
                <span className="text-xs font-bold text-gray-800">Step 04: Delivered To You</span>
                <ImageUpload
                  label=""
                  value={values["step_4_image"]}
                  onChange={(url) => handleChange("step_4_image", url)}
                  folder="how-it-works"
                  helperText="e.g. Home doorstep package delivery icon"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Same-Day Delivery Poster Banner */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <ImageIcon size={18} className="text-gb-green" />
              <h2 className="text-base font-bold text-gray-900">
                5. Same-Day Delivery Poster Section
              </h2>
            </div>

            <div className="space-y-4">
              <ImageUpload
                label="Delivery Banner Background Poster"
                value={values["delivery_banner_image_url"]}
                onChange={(url) => handleChange("delivery_banner_image_url", url)}
                folder="banners"
                helperText="Upload wide panoramic banner photo (leave empty for default organic forest green background)."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="gb-label">Top Eyebrow Tag</label>
                  <input
                    type="text"
                    value={values["delivery_banner_tag"]}
                    onChange={(e) => handleChange("delivery_banner_tag", e.target.value)}
                    placeholder="NEXT DAY DELIVERY"
                    className="gb-input font-bold"
                  />
                </div>
                <div>
                  <label className="gb-label">Button Label</label>
                  <input
                    type="text"
                    value={values["delivery_banner_btn_text"]}
                    onChange={(e) => handleChange("delivery_banner_btn_text", e.target.value)}
                    placeholder="Start Shopping"
                    className="gb-input font-bold text-gb-green"
                  />
                </div>
              </div>

              <div>
                <label className="gb-label">Banner Headline (Use newline for 2 lines)</label>
                <textarea
                  value={values["delivery_banner_headline"]}
                  onChange={(e) => handleChange("delivery_banner_headline", e.target.value)}
                  rows={2}
                  placeholder="Order before 1:00 PM,&#10;for next day delivery."
                  className="gb-input font-bold resize-none"
                />
              </div>

              <div>
                <label className="gb-label">Banner Description</label>
                <textarea
                  value={values["delivery_banner_description"]}
                  onChange={(e) => handleChange("delivery_banner_description", e.target.value)}
                  rows={3}
                  placeholder="Freshly cut, hygienically packed, and delivered straight to your kitchen..."
                  className="gb-input resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Announcement Bar */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Bell size={18} className="text-gb-green" />
              <h2 className="text-base font-bold text-gray-900">
                6. Top Announcement Strip
              </h2>
            </div>

            <div>
              <label className="gb-label">Header Top Strip Message</label>
              <input
                type="text"
                value={values["delivery_message"]}
                onChange={(e) => handleChange("delivery_message", e.target.value)}
                placeholder="Freshly cut. Hygienically packed. Delivered to your doorstep."
                className="gb-input"
              />
            </div>
          </div>
        </div>

        {/* Right column: Info & Live Mockup */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-gb-green" />
              Home Sections Overview
            </h3>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/70 space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-gray-200/50">
                <span className="text-gray-500">Hero Slider:</span>
                <span className="font-bold text-emerald-700">{activeHeroCount} Image(s)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200/50">
                <span className="text-gray-500">Farm-to-Door Banner:</span>
                <span className={`font-bold ${(values["freshness_banner_image"] || values["farm_to_door_image_url"]) ? "text-emerald-700" : "text-gray-400"}`}>
                  {(values["freshness_banner_image"] || values["farm_to_door_image_url"]) ? "Custom Uploaded" : "Default"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200/50">
                <span className="text-gray-500">Why Choose Us Cards:</span>
                <span className="font-bold text-emerald-700">4 Card Slots</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200/50">
                <span className="text-gray-500">How It Works Steps:</span>
                <span className="font-bold text-emerald-700">4 Step Node Slots</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200/50">
                <span className="text-gray-500">Delivery Poster:</span>
                <span className={`font-bold ${values["delivery_banner_image_url"] ? "text-emerald-700" : "text-gray-400"}`}>
                  {values["delivery_banner_image_url"] ? "Custom Photo" : "Default Gradient"}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed">
              Upload custom images for all sections and click "Publish Changes" to immediately update your live storefront in real-time.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
