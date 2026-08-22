import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getActiveCategories } from "@/lib/supabase/queries";
import type { Category } from "@/types/database";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Shop All Categories — Green Basket Kerala",
  description:
    "Shop fresh vegetables cuts, fruits, pure stone-ground curry powders, authentic masala blends, and cold-pressed traditional oils.",
};

function CategoryListCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex flex-col bg-white rounded-none border border-gray-200 shadow-2xs hover:shadow-xl hover:border-gb-green/40 transition-all duration-300 overflow-hidden"
      aria-label={`Browse ${category.name}`}
    >
      {/* Category Image Poster */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#FAFAF5] flex items-center justify-center p-4 rounded-none">
        <span className="absolute top-3.5 left-3.5 z-10 bg-white/90 backdrop-blur-xs text-gb-green text-[10px] font-bold px-2.5 py-1 rounded-full shadow-2xs border border-gray-100">
          Kerala Farm Direct
        </span>

        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300 select-none mix-blend-multiply"
            unoptimized={category.image_url?.startsWith("data:")}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Info Card Body */}
      <div className="p-6 flex flex-col flex-1 bg-white">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h2 className="font-extrabold text-gray-900 text-lg group-hover:text-gb-green transition-colors">
            {category.name}
          </h2>
          <span className="w-8 h-8 rounded-full bg-green-50 text-gb-green flex items-center justify-center shrink-0 group-hover:bg-gb-green group-hover:text-white transition-all">
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>

        {category.description && (
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
            {category.description}
          </p>
        )}

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gb-green">
          <span>Explore Products</span>
          <span className="text-[11px] text-gray-400 font-medium">Fresh Daily</span>
        </div>
      </div>
    </Link>
  );
}

export default async function CategoriesPage() {
  const categories = await getActiveCategories();

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="min-h-screen bg-[#FAFAF5]/60 pb-20">
        <div className="gb-container py-8 md:py-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex items-center gap-2 text-xs font-semibold text-gray-400" role="list">
              <li>
                <Link href="/" className="hover:text-gb-green transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gb-green font-bold" aria-current="page">
                All Categories
              </li>
            </ol>
          </nav>

          {/* Clean Normal Heading */}
          <div className="mb-8 text-left pt-1 pb-2">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-gb-green text-[11px] font-bold uppercase tracking-wider mb-3 border border-emerald-200/60 shadow-2xs">
              Curated Kitchen Essentials
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gb-charcoal tracking-tight leading-tight mb-3">
              Our <span style={{ color: "#245B35" }}>Categories</span>
            </h1>

            <p className="text-gray-500 text-sm sm:text-base max-w-2xl leading-relaxed">
              From freshly cut daily vegetables and grated coconut to sun-dried stone-ground powders and cold-pressed traditional oils.
            </p>
          </div>

          {/* Categories Grid */}
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <CategoryListCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 p-8">
              <p className="text-gray-500 text-lg font-bold">No categories active right now.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
