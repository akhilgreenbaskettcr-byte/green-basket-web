import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getAllActiveProducts, getActiveCategories } from "@/lib/supabase/queries";
import { ShopAllClient } from "@/components/products/ShopAllClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Shop All Fresh Cut Vegetables, Masala Powders & Cold Pressed Oils — Green Basket TCR",
  description:
    "Explore our full catalog of farm-fresh cut vegetables, traditional stone-ground curry powders, and 100% pure cold-pressed coconut oils delivered directly to your doorstep in Thrissur.",
  keywords: [
    "buy cut vegetables online Thrissur",
    "fresh vegetables shop Thrissur",
    "Kerala spices and curry powders",
    "cold pressed coconut oil Thrissur",
    "Green Basket TCR products",
  ],
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Shop All Fresh Products — Green Basket TCR Thrissur",
    description: "Browse all farm-fresh Kerala vegetables, homemade masalas, and pure oils with next-day Thrissur delivery.",
    url: "https://greenbaskettcr.com/products",
  },
};

export default async function ShopAllPage() {
  const [products, categories] = await Promise.all([
    getAllActiveProducts(),
    getActiveCategories(),
  ]);

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="min-h-screen bg-[#FAFAF5]/60 pb-20">
        <div className="gb-container py-6 md:py-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-xs font-semibold text-gray-400" role="list">
              <li>
                <Link href="/" className="hover:text-gb-green transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gb-green font-bold" aria-current="page">
                Shop All Products
              </li>
            </ol>
          </nav>

          {/* Heading */}
          <div className="mb-6 md:mb-8 text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-gb-green text-[11px] font-bold uppercase tracking-wider mb-2.5 border border-emerald-200/60 shadow-2xs">
              Farm Fresh & 100% Hygienic
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gb-charcoal tracking-tight leading-tight uppercase mb-2">
              ALL <span style={{ color: "#245B35" }}>PRODUCTS</span>
            </h1>

            <p className="text-gray-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Browse our freshly cut daily vegetables, stone-ground authentic Kerala spices, and traditional cold-pressed cooking oils.
            </p>
          </div>

          {/* Client Interactive Filter & Grid */}
          <ShopAllClient initialProducts={products} categories={categories} />
        </div>
      </main>
      <Footer />
    </>
  );
}
