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
  title: "Green Basket TCR — Fresh Cut Vegetables & Kerala Groceries Online Thrissur",
  description:
    "Buy fresh hygienically cut vegetables, authentic Kerala homemade curry powders, stone-ground masalas & 100% pure cold-pressed coconut oil online in Thrissur. Order before 1:00 PM for next-day doorstep delivery across Ayyanthole, Poonkunnam, Ollur, Kakkanad & Thrissur district.",
  keywords: [
    "online cut vegetables delivery Thrissur",
    "fresh cut vegetables Thrissur",
    "ready to cook vegetables Thrissur",
    "sambar cut vegetables Thrissur",
    "Kerala curry powders online",
    "cold pressed coconut oil Thrissur",
    "Green Basket TCR Thrissur",
    "grocery store Ayyanthole 680003",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Green Basket TCR — Fresh Cut Vegetables & Kerala Groceries Online Thrissur",
    description:
      "Order freshly cut vegetables, aromatic homemade masala powders & pure cold-pressed coconut oil delivered to your doorstep in Thrissur, Kerala.",
    url: "https://greenbaskettcr.com",
    siteName: "Green Basket TCR",
    locale: "en_IN",
    images: [
      {
        url: "/images/delivery-banner.png",
        width: 1200,
        height: 630,
        alt: "Green Basket TCR - Fresh Groceries Thrissur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Green Basket TCR — Fresh Cut Vegetables & Kerala Groceries Online Thrissur",
    description:
      "Fresh ready-to-cook vegetables, authentic stone-ground curry powders, and pure cold-pressed oils. Doorstep delivery in Thrissur, Kerala.",
    images: ["/images/delivery-banner.png"],
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
