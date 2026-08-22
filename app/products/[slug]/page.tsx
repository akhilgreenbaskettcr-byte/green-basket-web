import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductDetailClient } from "@/components/products/ProductDetailClient";
import { getProductBySlug } from "@/lib/supabase/queries";

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

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main-content">
        <div className="gb-container py-10 md:py-14">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-gray-400 flex-wrap" role="list">
              <li>
                <Link href="/" className="hover:text-gb-green transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/categories" className="hover:text-gb-green transition-colors">
                  Categories
                </Link>
              </li>
              {category && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link
                      href={`/categories/${category.slug}`}
                      className="hover:text-gb-green transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden="true">/</li>
              <li className="text-gb-charcoal font-medium" aria-current="page">
                {product.name}
              </li>
            </ol>
          </nav>

          {/* Product detail */}
          <ProductDetailClient product={product} />
        </div>
      </main>
      <Footer />
    </>
  );
}
