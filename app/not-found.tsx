import Link from "next/link";

export default function NotFound() {
  return (
    <>
      {/* Minimal nav bar — avoids next/headers restriction on not-found.tsx */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
        <Link href="/" className="font-bold text-gb-green text-lg">
          🌿 Green Basket
        </Link>
      </header>

      <main id="main-content" className="min-h-screen bg-gb-cream flex items-center justify-center py-20">
        <div className="gb-container text-center max-w-lg mx-auto">
          <p className="text-7xl font-bold text-gb-green/20 mb-4">404</p>
          <h1 className="text-3xl font-bold text-gb-charcoal mb-3">
            Nothing here.
          </h1>
          <p className="text-gray-500 text-base mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or may have moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="btn-primary">Go Home</Link>
            <Link href="/categories" className="btn-ghost">Browse Products</Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-7 bg-white/40 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} GREEN BASKET TCR. ALL RIGHTS RESERVED.
      </footer>
    </>
  );
}
