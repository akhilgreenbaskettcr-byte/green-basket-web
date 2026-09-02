import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/supabase/queries";
import CartPageContent from "./_client";

export const metadata: Metadata = {
  title: "Your Cart — Green Basket",
  description: "Review your cart and proceed to checkout.",
};

export default async function CartPage() {
  const settings = await getSiteSettings();
  const configuredDeliveryFee =
    settings["delivery_fee"] !== undefined && settings["delivery_fee"] !== ""
      ? Math.max(0, Number(settings["delivery_fee"]))
      : 40;

  return (
    <>
      <AnnouncementBar />
      <Header />
      <CartPageContent defaultDeliveryFee={configuredDeliveryFee} />
      <Footer />
    </>
  );
}
