import Image from "next/image";
import { Leaf, ShoppingBag, ShoppingCart, PackageCheck, Truck } from "lucide-react";
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
      icon: ShoppingBag,
    },
    {
      number: "02",
      title: "Place Your Order",
      description:
        "Add to cart and place your order in just a few clicks. It's quick and simple.",
      imageUrl: settings["step_2_image"] || "",
      imageAlt: "Place your grocery order",
      icon: ShoppingCart,
    },
    {
      number: "03",
      title: "We Prepare Fresh",
      description:
        "We carefully process, pack and get your order ready with care.",
      imageUrl: settings["step_3_image"] || "",
      imageAlt: "Fresh preparation and packing",
      icon: PackageCheck,
    },
    {
      number: "04",
      title: "Delivered To You",
      description:
        "Get your fresh ingredients delivered on time, right to your doorstep.",
      imageUrl: settings["step_4_image"] || "",
      imageAlt: "Doorstep delivery to home",
      icon: Truck,
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
          <div className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] mb-3 text-gb-green bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200/60 shadow-2xs">
            <Leaf size={12} className="text-gb-olive" />
            <span>HOW IT WORKS</span>
            <Leaf size={12} className="text-gb-olive" />
          </div>

          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black text-[#141414] tracking-tight leading-tight uppercase"
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

          {/* Curved Dotted Connecting Line for Mobile (2x2 Grid) */}
          <div
            className="lg:hidden absolute inset-0 pointer-events-none -z-0"
            aria-hidden="true"
          >
            <svg
              className="w-full h-full text-emerald-600/35 overflow-visible"
              viewBox="0 0 360 480"
              fill="none"
              preserveAspectRatio="none"
            >
              {/* Row 1 connection */}
              <path
                d="M 90,48 Q 180,18 270,48"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="5 6"
                strokeLinecap="round"
              />
              {/* Diagonal transition to Row 2 */}
              <path
                d="M 270,55 Q 310,180 90,285"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="5 6"
                strokeLinecap="round"
              />
              {/* Row 2 connection */}
              <path
                d="M 90,290 Q 180,260 270,290"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="5 6"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 sm:gap-10 lg:gap-8 relative z-10">
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.number}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Luminous Node Circle with Step Badge */}
                  <div className="relative mb-4 sm:mb-5">
                    {/* Outer soft glowing aura */}
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-[#EBF2EA] flex items-center justify-center border border-emerald-200/80 p-1.5 sm:p-2 shadow-sm group-hover:scale-105 transition-transform duration-300">
                      <div className="relative w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden shadow-2xs text-gb-green">
                        {step.imageUrl && step.imageUrl.trim() !== "" ? (
                          <Image
                            src={step.imageUrl}
                            alt={step.imageAlt}
                            fill
                            sizes="(max-width: 640px) 80px, 112px"
                            className="object-contain p-1 select-none"
                            unoptimized={step.imageUrl.startsWith("data:")}
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-emerald-50/70 group-hover:bg-emerald-100/80 transition-colors">
                            <StepIcon className="w-8 h-8 sm:w-11 sm:h-11 text-gb-green stroke-[1.75]" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step Number Badge */}
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-gb-green text-white text-[10px] sm:text-xs font-black tracking-widest px-2.5 sm:px-3.5 py-0.5 rounded-full shadow-md border-2 border-white">
                      {step.number}
                    </div>
                  </div>

                  {/* Step Title */}
                  <h3 className="font-black text-base sm:text-lg text-gb-charcoal mb-1 sm:mb-1.5 tracking-tight group-hover:text-gb-green transition-colors mt-2">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-[200px] sm:max-w-[220px]">
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
