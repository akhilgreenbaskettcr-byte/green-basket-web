// Server Component page wrapper
import { Suspense } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = {
  title: "Create Account — Green Basket",
  description: "Create a Green Basket account to save addresses and view your order history.",
};

export default function SignupPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="bg-gb-cream flex justify-center p-4 pt-6 pb-6 sm:pt-10 sm:pb-10">
        <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading…</div>}>
          <SignupForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
