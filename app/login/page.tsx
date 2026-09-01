// Server Component page — renders layout wrappers (AnnouncementBar, Header, Footer)
// LoginForm is split into a separate client component to avoid "use client" + next/headers conflict
import { Suspense } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign In — Green Basket",
  description: "Sign in to your Green Basket account to access saved addresses and order history.",
};

export default function LoginPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="bg-gb-cream flex justify-center p-4 pt-6 pb-6 sm:pt-10 sm:pb-10">
        <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
