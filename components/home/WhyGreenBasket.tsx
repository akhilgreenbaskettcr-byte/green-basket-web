import Image from "next/image";
import { Leaf, ShieldCheck, Clock, Sprout } from "lucide-react";
import type { SiteSettings } from "@/types/database";

interface WhyGreenBasketProps {
  settings?: SiteSettings;
}

export function WhyGreenBasket({ settings = {} }: WhyGreenBasketProps) {
  const cards = [
    {
      id: 1,
      icon: Leaf,
      title: "Farm Fresh Quality",
      description:
        "Sourced directly from trusted farms and carefully selected for the best quality.",
      imageUrl: settings["why_card_1_image"] || "",
      imageAlt: "Fresh farm quality ingredients",
    },
    {
      id: 2,
      icon: ShieldCheck,
      title: "Clean & Safe Products",
      description:
        "Hygienically processed and packed to maintain freshness, purity and nutritional value.",
      imageUrl: settings["why_card_2_image"] || "",
      imageAlt: "Clean and safe hygienically packed food",
    },
    {
      id: 3,
      icon: Clock,
      title: "Convenient & Reliable",
      description:
        "On-time delivery and ready-to-use products that make your cooking journey easier.",
      imageUrl: settings["why_card_3_image"] || "",
      imageAlt: "Convenient doorstep delivery bag",
    },
    {
      id: 4,
      icon: Sprout,
      title: "Naturally Better",
      description:
        "No artificial additives. No compromises. Just natural goodness you can feel.",
      imageUrl: settings["why_card_4_image"] || "",
      imageAlt: "Naturally pure authentic ingredients",
    },
  ];

  return (
    <section
      className="py-14 sm:py-16 md:py-24 bg-[#FAFAF5]/70 relative overflow-hidden"
      aria-labelledby="why-gb-heading"
    >
      {/* Subtle floating decorative leaves */}
      <div className="absolute top-12 left-8 opacity-30 pointer-events-none hidden md:block">
        <Leaf size={24} className="text-gb-olive rotate-45" />
      </div>
      <div className="absolute top-20 right-10 opacity-30 pointer-events-none hidden md:block">
        <Leaf size={28} className="text-gb-green -rotate-12" />
      </div>

      <div className="gb-container relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] mb-2.5 sm:mb-3 text-gb-green bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/60 shadow-2xs">
            <Leaf size={12} className="text-gb-olive" />
            <span>WHY CHOOSE US</span>
            <Leaf size={12} className="text-gb-olive" />
          </div>

          <h2
            id="why-gb-heading"
            className="text-2xl sm:text-4xl md:text-5xl font-black text-[#141414] tracking-tight leading-tight uppercase mb-2.5 sm:mb-3"
          >
            The Green Basket{" "}
            <span style={{ color: "#718F42" }}>difference.</span>
          </h2>

          <p className="text-gray-500 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            We bring you fresh, natural and convenient food solutions you can trust, every single day.
          </p>
        </div>

        {/* 4 Feature Cards: Clean 2x2 Grid on Mobile | 4 Columns on Desktop (Untouched) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden p-3.5 sm:p-6 lg:p-7 pb-0 sm:pb-0 lg:pb-0 min-h-[330px] sm:min-h-[440px] group"
              >
                {/* Top Content */}
                <div className="space-y-2.5 sm:space-y-4">
                  {/* Dark Green circular icon badge */}
                  <div className="w-9 h-9 sm:w-13 sm:h-13 rounded-full bg-[#245B35] text-white flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-xs">
                    <Icon className="w-4.5 h-4.5 sm:w-6 sm:h-6" strokeWidth={2.4} />
                  </div>

                  <div>
                    <h3 className="font-bold sm:font-extrabold text-[#141414] text-[13px] sm:text-lg md:text-xl leading-tight sm:leading-snug mb-1 sm:mb-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-500 text-[10.5px] sm:text-xs md:text-sm leading-snug sm:leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Image Slot — Anchored to bottom with perfect fit */}
                <div className="mt-3 sm:mt-4 flex items-end justify-center w-full relative h-24 sm:h-44 overflow-hidden">
                  {card.imageUrl && card.imageUrl.trim() !== "" ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={card.imageUrl}
                        alt={card.imageAlt}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 45vw, 25vw"
                        className="object-contain object-bottom scale-105 sm:scale-110 origin-bottom select-none mix-blend-multiply group-hover:scale-115 transition-transform duration-300"
                        unoptimized={card.imageUrl.startsWith("data:")}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-16 sm:h-24 mb-2 sm:mb-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-[10px] sm:text-xs font-medium">
                      <span>Ready for image</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
