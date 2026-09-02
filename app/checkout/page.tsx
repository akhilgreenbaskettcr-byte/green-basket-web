import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { createClient } from "@/utils/supabase/server";
import { getSiteSettings } from "@/lib/supabase/queries";
import type { DeliveryArea } from "@/types/database";

export const metadata: Metadata = {
  title: "Checkout — Green Basket",
  description: "Complete your order from Green Basket.",
};

export default async function CheckoutPage() {
  const supabase = await createClient();

  const [deliveryAreasRes, settings] = await Promise.all([
    supabase
      .from("delivery_areas")
      .select("*")
      .eq("is_active", true)
      .order("area_name", { ascending: true }),
    getSiteSettings(),
  ]);

  const deliveryAreas = deliveryAreasRes.data;
  const configuredDeliveryFee =
    settings["delivery_fee"] !== undefined && settings["delivery_fee"] !== ""
      ? Math.max(0, Number(settings["delivery_fee"]))
      : 40;
  const isCodEnabled = settings["enable_cod"] !== "false";

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="min-h-screen bg-gb-cream">
        <div className="gb-container py-10 md:py-14">
          <h1 className="text-3xl font-bold text-gb-charcoal mb-8">
            Checkout
          </h1>
          <CheckoutForm
            deliveryAreas={(deliveryAreas as DeliveryArea[]) ?? []}
            defaultDeliveryFee={configuredDeliveryFee}
            enableCod={isCodEnabled}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
