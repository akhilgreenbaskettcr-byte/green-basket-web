import Link from "next/link";
import Image from "next/image";
import { Leaf, ShieldCheck, Truck, Heart } from "lucide-react";
import type { SiteSettings } from "@/types/database";

interface DeliveryCTAProps {
  settings?: SiteSettings;
  cutoffTime?: string;
}

export function DeliveryCTA({ settings = {}, cutoffTime = "1:00 PM" }: DeliveryCTAProps) {
  let rawTag = settings["delivery_banner_tag"] || "NEXT DAY DELIVERY";
  if (rawTag.toUpperCase().includes("SAME DAY")) {
    rawTag = "NEXT DAY DELIVERY";
  }

  let rawHeadline = settings["delivery_banner_headline"] || `Order before ${cutoffTime},\nfor next day delivery.`;
  if (rawHeadline.toLowerCase().includes("get it today") || rawHeadline.toLowerCase().includes("same day")) {
    rawHeadline = `Order before ${cutoffTime},\nfor next day delivery.`;
  }

  let rawDescription =
    settings["delivery_banner_description"] ||
    "Freshly cut, hygienically packed, and delivered straight to your kitchen — next day fresh.";
  if (rawDescription.toLowerCase().includes("same day")) {
    rawDescription = "Freshly cut, hygienically packed, and delivered straight to your kitchen — next day fresh.";
  }

  const tag = rawTag;
  const headline = rawHeadline;
  const description = rawDescription;
  const buttonText = settings["delivery_banner_btn_text"] || "Start Shopping";
  const buttonUrl = settings["delivery_banner_btn_url"] || "/categories";
  const bannerImage = settings["delivery_banner_image_url"]?.trim() || "";

  const headlineLines = headline.includes("\n")
    ? headline.split("\n")
    : [headline];

  return (
    <section
      className={`relative overflow-hidden py-8 sm:py-10 md:py-12 my-6 md:my-8 rounded-2xl md:rounded-3xl ${
        bannerImage
          ? "bg-black"
          : "bg-linear-to-r from-[#245B35] via-[#1c472a] to-[#12311c]"
      }`}
      aria-label="Next day delivery banner"
    >
      {/* Background Image Container */}
      {bannerImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={bannerImage}
            alt="Delivery banner background"
            fill
            sizes="100vw"
            className="object-cover object-center md:object-right select-none"
            priority={false}
            unoptimized={bannerImage.startsWith("data:")}
          />
          {/* Enhanced high-contrast shadow overlay for 100% crisp white text readability */}
          <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/55 to-transparent md:from-black/75 md:via-black/40 md:to-transparent" />
        </div>
      )}

      {/* Ambient background glow when no image is loaded */}
      {!bannerImage && (
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-linear-to-l from-white/10 to-transparent pointer-events-none" />
      )}

      <div className="gb-container relative z-10">
        <div className="max-w-xl text-left space-y-3.5 sm:space-y-4">
          {/* Top Eyebrow Tag */}
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-[1px] bg-[#bbf062]/60" />
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#bbf062] drop-shadow-xs">
              {tag}
            </p>
            <span className="w-6 h-[1px] bg-[#bbf062]/60" />
          </div>

          {/* Bold White Headline */}
          <h2 className="text-2xl sm:text-3xl md:text-[2.35rem] font-black leading-[1.14] tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
            {headlineLines.map((line, idx) => (
              <span key={idx} className="block text-white">
                {line}
              </span>
            ))}
          </h2>

          {/* Description Text */}
          <p className="text-white/95 text-xs sm:text-sm leading-relaxed max-w-md font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">
            {description}
          </p>

          {/* CTA Button (Compact Lime Pill) */}
          <div className="pt-1">
            <Link
              href={buttonUrl}
              className="inline-flex items-center gap-2 bg-[#bbf062] hover:bg-[#adfc37] text-[#123816] font-black px-6 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 group cursor-pointer"
              id="delivery-cta-shop-btn"
            >
              <span>{buttonText}</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:translate-x-1 transition-transform"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* 4 Feature Badges with clean dividers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-0 pt-3 max-w-lg">
            <div className="flex flex-col items-center text-center sm:border-r border-white/30 sm:pr-2.5 py-0.5">
              <Leaf size={16} className="text-[#bbf062] mb-1 drop-shadow-xs" />
              <p className="text-[11px] sm:text-xs font-bold text-white leading-tight drop-shadow-xs">Fresh Produce</p>
            </div>

            <div className="flex flex-col items-center text-center sm:border-r border-white/30 sm:px-2.5 py-0.5">
              <ShieldCheck size={16} className="text-[#bbf062] mb-1 drop-shadow-xs" />
              <p className="text-[11px] sm:text-xs font-bold text-white leading-tight drop-shadow-xs">Hygienic Packing</p>
            </div>

            <div className="flex flex-col items-center text-center sm:border-r border-white/30 sm:px-2.5 py-0.5">
              <Truck size={16} className="text-[#bbf062] mb-1 drop-shadow-xs" />
              <p className="text-[11px] sm:text-xs font-bold text-white leading-tight drop-shadow-xs">Next Day Delivery</p>
            </div>

            <div className="flex flex-col items-center text-center sm:pl-2.5 py-0.5">
              <Heart size={16} className="text-[#bbf062] mb-1 drop-shadow-xs" />
              <p className="text-[11px] sm:text-xs font-bold text-white leading-tight drop-shadow-xs">Healthy Living</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
