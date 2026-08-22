import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types/database";

interface CategoryCardProps {
  category: Category;
}

function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="category-card group block"
      aria-label={`Browse ${category.name}`}
    >
      {/* Image */}
      <div className="relative w-full aspect-square rounded-none overflow-hidden mb-3 mx-auto max-w-[140px]">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 160px"
            className="object-cover product-image"
            unoptimized={category.image_url?.startsWith("data:")}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D1D5DB"
              strokeWidth="1.5"
              className="w-10 h-10"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Text */}
      <h3 className="font-semibold text-gb-charcoal text-sm leading-tight mb-1">
        {category.name}
      </h3>
      {category.description && (
        <p className="text-gray-400 text-xs leading-snug line-clamp-1">
          {category.description.split(".")[0]}
        </p>
      )}
    </Link>
  );
}

interface CategorySectionProps {
  categories: Category[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section
      className="py-14 md:py-18"
      aria-labelledby="category-section-heading"
    >
      <div className="gb-container">
        {/* Header */}
        <div className="text-center mb-10">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "#245B35" }}
          >
            Shop by Category
          </p>
          <h2
            id="category-section-heading"
            className="text-2xl md:text-3xl font-bold text-gb-charcoal"
          >
            Everything you need, in one place.
          </h2>
        </div>

        {/* Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>Categories coming soon.</p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/categories"
            className="btn-ghost"
            id="view-all-categories-btn"
          >
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
}
