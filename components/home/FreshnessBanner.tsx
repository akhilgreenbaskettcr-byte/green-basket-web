import Link from "next/link";
import Image from "next/image";
import {
  Leaf,
  Clock3,
  Truck,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import type { SiteSettings } from "@/types/database";

interface FreshnessBannerProps {
  settings?: SiteSettings;
}

const BENEFITS = [
  {
    icon: Leaf,
    title: "Fresh Harvest",
    subtitle: "Direct from farms",
  },
  {
    icon: Clock3,
    title: "1 PM Cutoff",
    subtitle: "Daily fresh dispatch",
  },
  {
    icon: Truck,
    title: "Doorstep Delivery",
    subtitle: "Next morning fresh",
  },
  {
    icon: ShieldCheck,
    title: "100% Quality",
    subtitle: "Clean & hygienic",
  },
];

export function FreshnessBanner({ settings = {} }: FreshnessBannerProps) {
  // Read uploaded banner image from Supabase site settings
  const imageUrl =
    settings["freshness_banner_image"]?.trim() ||
    settings["farm_to_door_image_url"]?.trim() ||
    "";

  return (
    <section
      className="py-2.5 sm:py-4 md:py-6 overflow-hidden"
      aria-label="Farm to Door Freshness Guarantee"
    >
      <div className="gb-container">
        {/* Main Card Container */}
        <div
          className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-sm transition-shadow ${
            imageUrl ? "bg-[#f3faf4]" : "border border-emerald-100/80 bg-[#f3faf4]"
          }`}
        >
          {/* ── DESKTOP BACKGROUND IMAGE (Scaled to eliminate any baked-in white canvas borders) ── */}
          {imageUrl ? (
            <div className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
              <Image
                src={imageUrl}
                alt="No day-old storage — just pure farm-to-door freshness"
                fill
                sizes="(max-width: 1400px) 95vw, 1400px"
                className="object-cover object-right select-none scale-[1.045] origin-center"
                priority={false}
                unoptimized={imageUrl.startsWith("data:")}
              />
            </div>
          ) : (
            /* Ambient Leaves if no image */
            <div className="hidden lg:block absolute inset-0 pointer-events-none">
              <div className="absolute top-4 right-[42%] text-emerald-600/15">
                <Leaf size={32} className="rotate-45" />
              </div>
              <div className="absolute bottom-6 left-3 text-emerald-600/15">
                <Leaf size={38} className="-rotate-12" />
              </div>
              <div className="absolute bottom-4 right-[38%] text-emerald-600/15">
                <Leaf size={26} className="rotate-90" />
              </div>
            </div>
          )}

          {/* Foreground Content */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 items-center gap-5 lg:gap-8 relative z-10 p-5 sm:p-7 md:p-8 lg:p-10 xl:p-12">
            
            {/* ── Left Content Column (Desktop: 7 cols ~ 58%) ── */}
            <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center">
              
              {/* 1. Eyebrow Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs border border-emerald-600/25 text-emerald-800 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider w-fit mb-3 sm:mb-3.5 shadow-2xs">
                <Leaf size={13} className="text-emerald-700 shrink-0" />
                <span>Pure Farm-To-Door Harvest</span>
              </div>

              {/* 2. Main Headline (Compact & Sleek) */}
              <h2 className="text-2xl sm:text-3xl md:text-[2.2rem] lg:text-[2.35rem] xl:text-[2.6rem] font-black tracking-tight leading-[1.12] mb-3 text-[#111827]">
                <span className="block">No day-old storage—</span>
                <span className="text-[#1c532b] flex items-center gap-1.5 sm:gap-2 flex-wrap mt-0.5">
                  <span>just pure farm-to-door</span>
                  <span className="inline-flex items-center">
                    <span>freshness.</span>
                    <Leaf
                      size={26}
                      className="text-[#1c532b] fill-[#1c532b] inline-block ml-1 rotate-12 shrink-0"
                    />
                  </span>
                </span>
              </h2>

              {/* 3. Subtitle Description */}
              <p className="text-gray-700 text-xs sm:text-sm md:text-[14.5px] leading-relaxed max-w-xl mb-4 sm:mb-6 font-medium">
                Order by{" "}
                <strong className="text-gray-900 font-bold bg-white/70 px-1 py-0.5 rounded text-[#1c532b]">
                  1 PM today
                </strong>{" "}
                to enjoy crisp, freshly harvested vegetables and premium quality
                fruits delivered straight to your doorstep tomorrow morning.
              </p>

              {/* 4. Four Compact Trust Feature Cards (2x2 Grid on mobile, 4-col row on desktop) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 mb-5 sm:mb-6 max-w-2xl">
                {BENEFITS.map(({ icon: Icon, title, subtitle }) => (
                  <div
                    key={title}
                    className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-emerald-100 shadow-2xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 flex items-center justify-center text-[#1c532b] mb-1.5 shrink-0">
                      <Icon size={14} />
                    </div>
                    <div>
                      <p className="text-[11.5px] sm:text-xs font-bold text-gray-900 leading-tight">
                        {title}
                      </p>
                      <p className="text-[9.5px] sm:text-[10px] text-gray-500 leading-tight mt-0.5">
                        {subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 5. Primary CTA Button */}
              <div className="w-full sm:w-auto">
                <Link
                  href="/products"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1c532b] hover:bg-[#153e20] text-white font-bold text-xs sm:text-sm px-6 sm:px-7 py-3 sm:py-3.5 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-102 group"
                >
                  <span>Order Tomorrow's Fresh Basket</span>
                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            </div>

            {/* ── Right Column: Spacer to let the background basket artwork show on desktop ── */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-5 min-h-[300px] xl:min-h-[340px] pointer-events-none" />

          </div>
        </div>
      </div>
    </section>
  );
}
