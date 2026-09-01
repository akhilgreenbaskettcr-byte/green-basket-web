import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "About Green Basket TCR — Fresh Farm-to-Kitchen Groceries in Thrissur",
  description:
    "Learn about Green Basket TCR, Thrissur's premier online grocery service offering hygienically cut vegetables, traditional Kerala curry powders, and pure cold-pressed coconut oil delivered fresh.",
  keywords: [
    "about Green Basket TCR",
    "fresh vegetables Thrissur story",
    "Kerala organic grocery brand",
    "Ayyanthole Thrissur vegetables",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Green Basket TCR — Fresh Farm-to-Kitchen Groceries Thrissur",
    description: "Learn about Green Basket TCR and our mission to simplify Kerala kitchens with farm-fresh produce.",
    url: "https://greenbaskettcr.com/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="min-h-screen">
        {/* Hero */}
        <div className="py-16 md:py-24 bg-white border-b border-gb-border">
          <div className="gb-container text-center max-w-3xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#245B35" }}>Our Story</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gb-charcoal mb-6 leading-tight">
              Fresh from Kerala kitchens<br />to yours.
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed">
              Green Basket was born from a simple belief: cooking at home should be easy, and fresh ingredients should always be at hand. We work with local farmers and producers to bring you the finest Kerala produce, hygienically prepared and delivered the same day.
            </p>
          </div>
        </div>

        {/* Story content */}
        <div className="py-16 bg-gb-cream">
          <div className="gb-container max-w-3xl mx-auto">
            <div className="prose prose-gray max-w-none space-y-6">
              <div className="bg-white rounded-2xl border border-gb-border p-8 md:p-10">
                <h2 className="text-2xl font-bold text-gb-charcoal mb-4">Why we started</h2>
                <p className="text-gray-500 leading-relaxed">
                  Kerala cooking is rich, aromatic, and deeply satisfying — but it requires fresh, quality ingredients. We started Green Basket to solve a simple problem: getting the right ingredients, at the right time, without compromising on freshness or hygiene.
                </p>
                <p className="text-gray-500 leading-relaxed mt-4">
                  From our kitchen to yours, every product we offer is prepared on the day of delivery. No frozen stock. No old produce. Just fresh, clean, and ready-to-use ingredients that make your cooking easier and better.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { number: "20+", label: "Products", desc: "Across 6 categories" },
                  { number: "100%", label: "Fresh", desc: "Prepared same day" },
                  { number: "1 PM", label: "Cutoff", desc: "For same-day delivery" },
                ].map(({ number, label, desc }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gb-border p-6 text-center">
                    <p className="text-3xl font-bold" style={{ color: "#245B35" }}>{number}</p>
                    <p className="font-semibold text-gb-charcoal mt-1">{label}</p>
                    <p className="text-gray-400 text-sm">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 text-center">
              <Link href="/categories" className="btn-primary">
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
