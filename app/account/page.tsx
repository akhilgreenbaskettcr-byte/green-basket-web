import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AccountClient } from "@/components/account/AccountClient";

export const metadata: Metadata = {
  title: "My Account & Orders — Green Basket",
  description: "Track your orders and view your account details with Green Basket.",
};

export default function AccountPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="min-h-screen bg-gb-cream">
        <div className="gb-container py-12 md:py-16">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gb-charcoal mb-2">My Account</h1>
            <p className="text-gray-500 text-sm mb-8">Track your orders and manage your details</p>
            <AccountClient />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
