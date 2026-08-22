import Image from "next/image";
import { Leaf } from "lucide-react";
import type { SiteSettings } from "@/types/database";

interface HowItWorksProps {
  settings?: SiteSettings;
}

export function HowItWorks({ settings = {} }: HowItWorksProps) {
  const steps = [
    {
      number: "01",
      title: "Browse Products",
      description:
        "Explore our wide range of fresh ingredients and choose what you need.",
      imageUrl: settings["step_1_image"] || "",
      imageAlt: "Browse fresh products",
    },
    {
      number: "02",
      title: "Place Your Order",
      description:
        "Add to cart and place your order in just a few clicks. It's quick and simple.",
      imageUrl: settings["step_2_image"] || "",
      imageAlt: "Place your grocery order",
    },
    {
      number: "03",
      title: "We Prepare Fresh",
      description:
        "We carefully process, pack and get your order ready with care.",
      imageUrl: settings["step_3_image"] || "",
      imageAlt: "Fresh preparation and packing",
    },
    {
      number: "04",
      title: "Delivered To You",
      description:
        "Get your fresh ingredients delivered on time, right to your doorstep.",
      imageUrl: settings["step_4_image"] || "",
      imageAlt: "Doorstep delivery to home",
    },
  ];

  return (
    <section
      className="py-16 md:py-24 bg-white relative overflow-hidden"
      aria-labelledby="how-it-works-heading"
    >
      {/* Decorative leaf accents */}
      <div className="absolute top-10 left-6 opacity-30 pointer-events-none hidden md:block">
        <Leaf size={24} className="text-gb-olive -rotate-45" />
      </div>
      <div className="absolute bottom-10 right-6 opacity-30 pointer-events-none hidden md:block">
        <Leaf size={26} className="text-gb-green rotate-12" />
      </div>

      <div className="gb-container relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] mb-3 text-gb-green">
            <span className="text-gb-olive">🌱</span>
            <span>HOW IT WORKS</span>
            <span className="text-gb-olive">🍃</span>
          </div>

          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black text-[#141414] tracking-tight leading-tight"
          >
            Fresh <span style={{ color: "#718F42" }}>made simple.</span>
          </h2>
        </div>

        {/* 4 Process Nodes Grid with Curved Connector */}
        <div className="relative">
          {/* Curved Dotted Connecting Line for Desktop */}
          <div
            className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-12 pointer-events-none -z-0"
            aria-hidden="true"
          >
            <svg
              className="w-full h-full text-emerald-600/40 overflow-visible"
              viewBox="0 0 1000 60"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M 20,30 Q 180,-10 330,30 T 660,30 T 980,30"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray="6 8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 relative z-10">
            {steps.map((step) => {
              return (
                <div
                  key={step.number}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Luminous Node Circle with Step Badge */}
                  <div className="relative mb-5">
                    {/* Outer soft glowing aura */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#EBF2EA] flex items-center justify-center border border-emerald-200/80 p-2 shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <div className="relative w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden shadow-2xs">
                        {step.imageUrl && step.imageUrl.trim() !== "" ? (
                          <Image
                            src={step.imageUrl}
                            alt={step.imageAlt}
                            fill
                            sizes="(max-width: 640px) 96px, 112px"
                            className="object-contain p-1 select-none"
                            unoptimized={step.imageUrl.startsWith("data:")}
                          />
                        ) : (
                          <span className="text-xs font-bold text-gray-400">
                            Icon {step.number}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Step number badge */}
                    <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-gb-green text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full shadow-xs border-2 border-white">
                      {step.number}
                    </span>
                  </div>

                  {/* Text */}
                  <h3 className="font-extrabold text-[#141414] text-lg sm:text-xl mb-2 mt-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-[240px]">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
