"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Leaf, Package, Truck } from "lucide-react";
import type { SiteSettings } from "@/types/database";

const TRUST_ITEMS = [
  {
    icon: Leaf,
    title: "100% Fresh",
    desc: "Direct from farms",
  },
  {
    icon: Package,
    title: "Hygienically Packed",
    desc: "Clean & ready",
  },
  {
    icon: Truck,
    title: "Quick Delivery",
    desc: "Same day dispatch",
  },
];

interface HeroSectionProps {
  settings?: SiteSettings;
}

export function HeroSection({ settings = {} }: HeroSectionProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  const headlineLine1 = settings["hero_headline_line1"] || "Fresh ingredients.";
  const headlineLine2 = settings["hero_headline_line2"] || "Made simple.";
  const description =
    settings["hero_description"] ||
    "From freshly cut vegetables to aromatic powders and pure oils — everything your kitchen needs, made easy.";

  // Multi-image slider support (Up to 3 images)
  const img1 =
    settings["hero_image_url"] ||
    "https://res.cloudinary.com/pjgmmeb8/image/upload/v1787394877/green-basket/hero/hero_vegetables_main.jpg";
  const img2 = settings["hero_image_url_2"]?.trim() || "";
  const img3 = settings["hero_image_url_3"]?.trim() || "";

  const heroImages = [img1, img2, img3].filter(Boolean);

  // Auto-slide effect if multiple images exist
  useEffect(() => {
    if (heroImages.length <= 1) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroImages.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <section
      className="hero-section bg-white py-4 sm:py-6 md:py-10 lg:py-14 overflow-hidden border-b border-gray-100/60"
      aria-label="Featured promotion"
    >
      <div className="gb-container">
        <div
          className={`flex flex-col md:grid ${
            heroImages.length > 0
              ? "md:grid-cols-12"
              : "md:grid-cols-1 max-w-2xl mx-auto text-center"
          } md:items-center md:gap-6 lg:gap-12 md:min-h-[500px]`}
        >
          {/* 1. MOBILE: IMAGE IS ON TOP (order-1) | DESKTOP: RIGHT COLUMN (md:order-2, md:col-span-6 lg:col-span-7) */}
          {heroImages.length > 0 && (
            <div className="order-1 md:order-2 md:col-span-6 lg:col-span-7 flex items-center justify-center lg:justify-end py-2 sm:py-4">
              <div className="relative w-full max-w-[340px] sm:max-w-[450px] md:max-w-[580px] lg:max-w-[670px] xl:max-w-[720px] aspect-[4/3] sm:aspect-[16/11] md:aspect-[4/3] transition-all duration-300">
                {heroImages.map((src, index) => {
                  const isActive = index === activeSlide;
                  return (
                    <div
                      key={src + index}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        isActive
                          ? "opacity-100 z-10"
                          : "opacity-0 z-0 pointer-events-none"
                      }`}
                    >
                      <Image
                        src={src}
                        alt={`Green Basket fresh groceries ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 90vw, (max-width: 1200px) 55vw, 700px"
                        className="object-contain object-center lg:object-right select-none mix-blend-multiply p-0.5 sm:p-1 lg:p-1.5"
                        priority={index === 0}
                        unoptimized={src.startsWith("data:")}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. MOBILE: TEXT IS UNDER IMAGE (order-2) | DESKTOP: LEFT COLUMN (md:order-1, md:col-span-6 lg:col-span-5) */}
          <div className="order-2 md:order-1 md:col-span-6 lg:col-span-5 flex flex-col justify-center py-4 md:py-8 z-10">
            {/* Headline — STRICTLY 2 LINES */}
            <h1 className="text-[2rem] sm:text-[2.6rem] md:text-[2.85rem] lg:text-[3.25rem] xl:text-[3.6rem] font-bold leading-[1.08] tracking-tight mb-3 sm:mb-4">
              <span className="text-gb-charcoal block sm:whitespace-nowrap">
                {headlineLine1}
              </span>
              <span className="block sm:whitespace-nowrap" style={{ color: "#245B35" }}>
                {headlineLine2}
              </span>
            </h1>

            {/* Description */}
            <p className="text-gray-500 text-xs sm:text-base md:text-lg leading-relaxed mb-5 sm:mb-8 max-w-md">
              {description}
            </p>

            {/* Trust indicators (Clean 3-col grid on mobile, inline on tablet/desktop) */}
            <div className="grid grid-cols-3 sm:flex sm:flex-nowrap items-center gap-2 sm:gap-6 mb-6 sm:mb-9">
              {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-2.5 bg-gray-50/70 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-gray-100"
                >
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#e8f5ee" }}
                    aria-hidden="true"
                  >
                    <Icon size={16} style={{ color: "#245B35" }} />
                  </div>
                  <div>
                    <p className="text-[11px] sm:text-[13px] font-bold sm:font-semibold text-gb-charcoal leading-tight">
                      {title}
                    </p>
                    <p className="text-[9px] sm:text-[11px] text-gray-400 leading-tight mt-0.5 hidden xs:block sm:block">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/categories"
                className="btn-primary text-xs sm:text-sm px-5 sm:px-7 py-2.5 sm:py-3 shadow-xs"
                id="hero-shop-now-btn"
              >
                Shop Now
              </Link>
              <Link
                href="/categories"
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gb-charcoal hover:text-gb-green transition-colors group"
                id="hero-explore-categories-btn"
              >
                Explore Categories
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Interactive Indicator dots (Expands active slide dot) */}
            {heroImages.length > 1 ? (
              <div
                className="flex items-center gap-2 mt-6 sm:mt-9"
                role="tablist"
                aria-label="Hero carousel pagination"
              >
                {heroImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeSlide
                        ? "w-7 bg-gb-green shadow-2xs"
                        : "w-2.5 bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                    aria-selected={idx === activeSlide}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-6 sm:mt-9" aria-hidden="true">
                <span className="w-6 h-2.5 rounded-full bg-gb-green" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
