import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CategoryShopClient } from "@/components/categories/CategoryShopClient";
import {
  getActiveCategories,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "Category Not Found" };
  }

  return {
    title: `${category.name} — Green Basket`,
    description:
      category.description ??
      `Shop fresh ${category.name.toLowerCase()} from Green Basket. Hygienically packed and delivered to your doorstep.`,
    openGraph: {
      title: `${category.name} — Green Basket`,
      description: category.description ?? undefined,
      images: category.image_url ? [category.image_url] : [],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [categories, category] = await Promise.all([
    getActiveCategories(),
    getCategoryBySlug(slug),
  ]);

  if (!category) notFound();

  const categoryProducts = await getProductsByCategory(category.id);

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="min-h-screen bg-[#FAFAF5]/60 pb-20">
        <div className="gb-container py-8 md:py-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-xs font-semibold text-gray-400" role="list">
              <li>
                <Link href="/" className="hover:text-gb-green transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/categories" className="hover:text-gb-green transition-colors">
                  Shop Catalogue
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gb-green font-bold" aria-current="page">
                {category.name}
              </li>
            </ol>
          </nav>

          {/* Interactive Shop Client with Poster Banner & Filters */}
          <CategoryShopClient
            categories={categories}
            currentCategory={category}
            initialProducts={categoryProducts}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
