import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout — Green Basket",
  description: "Complete your order from Green Basket.",
};

export default function CheckoutPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="min-h-screen bg-gb-cream">
        <div className="gb-container py-10 md:py-14">
          <h1 className="text-3xl font-bold text-gb-charcoal mb-8">
            Checkout
          </h1>
          <CheckoutForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
