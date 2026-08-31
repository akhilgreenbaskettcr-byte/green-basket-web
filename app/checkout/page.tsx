import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { createClient } from "@/utils/supabase/server";
import type { DeliveryArea } from "@/types/database";

export const metadata: Metadata = {
  title: "Checkout — Green Basket",
  description: "Complete your order from Green Basket.",
};

export default async function CheckoutPage() {
  const supabase = await createClient();

  const { data: deliveryAreas } = await supabase
    .from("delivery_areas")
    .select("*")
    .eq("is_active", true)
    .order("area_name", { ascending: true });

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="min-h-screen bg-gb-cream">
        <div className="gb-container py-10 md:py-14">
          <h1 className="text-3xl font-bold text-gb-charcoal mb-8">
            Checkout
          </h1>
          <CheckoutForm deliveryAreas={(deliveryAreas as DeliveryArea[]) ?? []} />
        </div>
      </main>
      <Footer />
    </>
  );
}
