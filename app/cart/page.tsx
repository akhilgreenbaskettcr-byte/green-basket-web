import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import CartPageContent from "./_client";

export const metadata: Metadata = {
  title: "Your Cart — Green Basket",
  description: "Review your cart and proceed to checkout.",
};

export default function CartPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <CartPageContent />
      <Footer />
    </>
  );
}
