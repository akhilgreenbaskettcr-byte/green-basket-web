import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Order Placed — Green Basket",
  description: "Your order has been placed successfully.",
};

interface Props {
  searchParams: Promise<{ order?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { order } = await searchParams;

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="min-h-screen bg-gb-cream flex items-center justify-center py-20">
        <div className="gb-container">
          <div className="max-w-lg mx-auto text-center">
            {/* Success icon */}
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: "#e8f5ee" }}
              aria-hidden="true"
            >
              <CheckCircle size={48} style={{ color: "#245B35" }} />
            </div>

            <h1 className="text-3xl font-bold text-gb-charcoal mb-3">
              Order Placed!
            </h1>

            {order && (
              <div className="bg-white rounded-2xl border border-gb-border px-6 py-4 mb-6 inline-block">
                <p className="text-sm text-gray-500 mb-1">Your Order Number</p>
                <p className="text-2xl font-bold text-gb-charcoal tracking-wider">
                  {order}
                </p>
              </div>
            )}

            <p className="text-gray-500 text-base leading-relaxed mb-8">
              Thank you for your order! We&apos;ve received it and will begin
              preparing your fresh groceries shortly. You&apos;ll receive your
              delivery today if ordered before 1 PM.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/categories" className="btn-primary">
                Continue Shopping
              </Link>
              <Link href="/account" className="btn-ghost">
                View My Orders
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
