import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <AnnouncementBar />
      <Header />
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
      <Footer />
    </>
  );
}
