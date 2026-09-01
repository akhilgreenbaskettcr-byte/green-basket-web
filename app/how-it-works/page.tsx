import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HowItWorks } from "@/components/home/HowItWorks";
import { getSiteSettings } from "@/lib/supabase/queries";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works — Green Basket TCR",
  description:
    "See how Green Basket works — choose your products, place your order, get it delivered fresh to your doorstep in Thrissur, Kerala.",
};

export default async function HowItWorksPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="bg-white min-h-screen">
        <HowItWorks settings={settings} />

        {/* Call to action section */}
        <div className="py-16 bg-[#FAFAF5] text-center border-t border-gray-100">
          <div className="gb-container max-w-xl mx-auto space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-gb-green text-[11px] font-bold uppercase tracking-wider border border-emerald-200/60 shadow-2xs">
              START COOKING FRESH
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gb-charcoal uppercase tracking-tight">
              Ready to simplify your kitchen?
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              Order fresh cold-cut vegetables, stone-ground powders, and traditional cold-pressed oils today.
            </p>
            <div className="pt-2">
              <Link href="/categories" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wide">
                <span>Browse Products</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
