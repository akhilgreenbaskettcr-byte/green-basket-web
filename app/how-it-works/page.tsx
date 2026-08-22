import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HowItWorks } from "@/components/home/HowItWorks";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works — Green Basket",
  description:
    "See how Green Basket works — choose your products, place your order, get it delivered fresh to your doorstep.",
};

export default function HowItWorksPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main-content">
        <div className="py-14 md:py-20 bg-white text-center border-b border-gb-border">
          <div className="gb-container">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#245B35" }}>Simple & Fast</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gb-charcoal mb-4">How It Works</h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
              Getting fresh ingredients from Green Basket is as simple as three steps.
            </p>
          </div>
        </div>
        <HowItWorks />
        <div className="py-14 bg-gb-cream text-center">
          <div className="gb-container">
            <h2 className="text-2xl font-bold text-gb-charcoal mb-4">Ready to simplify your kitchen?</h2>
            <Link href="/categories" className="btn-primary">Browse Products</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
