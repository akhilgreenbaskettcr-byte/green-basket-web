import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { CategorySection } from "@/components/home/CategorySection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { WhyGreenBasket } from "@/components/home/WhyGreenBasket";
import { HowItWorks } from "@/components/home/HowItWorks";
import { DeliveryCTA } from "@/components/home/DeliveryCTA";
import {
  getActiveCategories,
  getFeaturedProducts,
  getSiteSettings,
} from "@/lib/supabase/queries";

// Ensure homepage always fetches fresh settings from database in real-time
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Green Basket — Your Kitchen, Simplified",
  description:
    "Fresh vegetables, aromatic powders, and pure Kerala oils delivered fresh to your doorstep. Order before 1 PM for same-day delivery.",
  openGraph: {
    title: "Green Basket — Your Kitchen, Simplified",
    description:
      "Fresh vegetables, aromatic powders, and pure Kerala oils delivered fresh to your doorstep.",
  },
};

export default async function HomePage() {
  const [categories, featuredProducts, settings] = await Promise.all([
    getActiveCategories(),
    getFeaturedProducts(),
    getSiteSettings(),
  ]);

  const cutoffTime = settings["same_day_cutoff_time"] ?? "1:00 PM";

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main-content">
        <HeroSection settings={settings} />
        <CategorySection categories={categories} />
        <FeaturedProducts products={featuredProducts} />
        <WhyGreenBasket settings={settings} />
        <HowItWorks settings={settings} />
        <DeliveryCTA settings={settings} cutoffTime={cutoffTime} />
      </main>
      <Footer />
    </>
  );
}
