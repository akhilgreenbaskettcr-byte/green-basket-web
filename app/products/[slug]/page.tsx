import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductDetailClient } from "@/components/products/ProductDetailClient";
import { ProductCardClient } from "@/components/products/ProductCardClient";
import { getProductBySlug, getProductsByCategory } from "@/lib/supabase/queries";
import { ChevronRight, Home, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Product Not Found" };

  const lowestPrice = product.product_variants
    .filter((v) => v.is_available)
    .reduce(
      (min, v) => (v.price < min ? v.price : min),
      Infinity
    );

  return {
    title: `${product.name} — Green Basket`,
    description:
      product.description ??
      `Buy ${product.name} from Green Basket. Fresh, hygienically packed and delivered to your doorstep.`,
    openGraph: {
      title: `${product.name} — Green Basket`,
      description: product.description ?? undefined,
      images: product.image_url ? [product.image_url] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const category = product.categories;
  const relatedProducts = category
    ? (await getProductsByCategory(product.category_id))
        .filter((p) => p.id !== product.id)
        .slice(0, 4)
    : [];

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="bg-[#FAFAF7] min-h-screen py-6 sm:py-10">
        <div className="gb-container">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
            <ol
              className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 flex-wrap bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-gray-200/60 shadow-2xs"
              role="list"
            >
              <li className="flex items-center">
                <Link
                  href="/"
                  className="hover:text-gb-green transition-colors flex items-center gap-1 font-medium text-gray-600"
                >
                  <Home size={13} className="text-gray-400" />
                  <span>Home</span>
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-300">
                <ChevronRight size={13} />
              </li>
              <li>
                <Link
                  href="/categories"
                  className="hover:text-gb-green transition-colors font-medium text-gray-600"
                >
                  Categories
                </Link>
              </li>
              {category && (
                <>
                  <li aria-hidden="true" className="text-gray-300">
                    <ChevronRight size={13} />
                  </li>
                  <li>
                    <Link
                      href={`/categories/${category.slug}`}
                      className="hover:text-gb-green transition-colors font-medium text-gray-600"
                    >
                      {category.name}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden="true" className="text-gray-300 hidden sm:inline-flex">
                <ChevronRight size={13} />
              </li>
              <li
                className="text-gb-green font-semibold truncate max-w-[180px] sm:max-w-[260px] hidden sm:inline-flex"
                aria-current="page"
              >
                {product.name}
              </li>
            </ol>
          </nav>

          {/* Product Hero — Open & Editorial */}
          <div className="mb-14 sm:mb-20">
            <ProductDetailClient product={product} />
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <section className="mt-12 sm:mt-16 pt-10 border-t border-gray-200/80">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-2">
                <div>
                  <span className="text-xs font-bold tracking-wider uppercase text-gb-olive flex items-center gap-1.5 mb-1 font-mono">
                    <Sparkles size={14} className="text-amber-500" /> Discover More
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gb-charcoal tracking-tight">
                    You Might Also Like
                  </h2>
                </div>
                {category && (
                  <Link
                    href={`/categories/${category.slug}`}
                    className="text-xs sm:text-sm font-bold text-gb-green hover:text-gb-green-dark inline-flex items-center gap-1 group"
                  >
                    View all in {category.name}
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5">
                {relatedProducts.map((relProduct) => (
                  <ProductCardClient key={relProduct.id} product={relProduct} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}


