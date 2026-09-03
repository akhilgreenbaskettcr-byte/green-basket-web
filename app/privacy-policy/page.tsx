import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/supabase/queries";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Privacy Policy — Green Basket TCR",
  description:
    "Learn how Green Basket TCR collects, protects, and handles your personal information, delivery data, and secure Razorpay payment transactions.",
};

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();
  const address = settings["contact_address"] ?? "Green Basket Tcr, Near Ayyanthole Ground, Thrissur, Kerala - 680003.";
  const phone = settings["contact_phone"] ?? "+91 90481 78886";
  const email = settings["contact_email"] ?? "info@greenbaskettcr.com";

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="min-h-screen bg-[#FAFAF5]/60 pb-20">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200/70 py-10 md:py-14">
          <div className="gb-container max-w-4xl">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                <li>
                  <Link href="/" className="hover:text-gb-green transition-colors">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-gb-green font-bold" aria-current="page">
                  Privacy Policy
                </li>
              </ol>
            </nav>

            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-gb-green text-[11px] font-bold uppercase tracking-wider mb-3 border border-emerald-200/60 shadow-2xs">
              DATA PRIVACY & SECURITY
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gb-charcoal tracking-tight leading-tight uppercase mb-3">
              PRIVACY <span style={{ color: "#245B35" }}>POLICY</span>
            </h1>

            <p className="text-gray-500 text-xs sm:text-sm md:text-base leading-relaxed">
              Last updated: September 1, 2026. Green Basket TCR ("we", "us", or "our") is dedicated to protecting your personal data, ensuring complete confidentiality, and maintaining transparent data handling practices.
            </p>
          </div>
        </div>

        {/* Policy Content */}
        <div className="gb-container max-w-4xl pt-10">
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-2xs space-y-10 text-gb-charcoal">
            {/* Trust Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-gray-100">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/70 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/60 text-gb-green flex items-center justify-center">
                  <Lock size={18} />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">PAYMENT SECURITY</h2>
                <p className="text-xs text-gray-600 font-semibold">256-Bit SSL Encryption</p>
                <p className="text-[11px] text-gray-400">Powered directly by Razorpay</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/70 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/60 text-gb-green flex items-center justify-center">
                  <Eye size={18} />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">NO THIRD-PARTY SALE</h2>
                <p className="text-xs text-gray-600 font-semibold">100% Confidential</p>
                <p className="text-[11px] text-gray-400">We never sell your data</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/70 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/60 text-gb-green flex items-center justify-center">
                  <Shield size={18} />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">INDIAN IT ACT</h2>
                <p className="text-xs text-gray-600 font-semibold">Fully Compliant</p>
                <p className="text-[11px] text-gray-400">Indian Cyber & IT Regulations</p>
              </div>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                1. Information We Collect
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                When you visit Green Basket TCR or place an order for our fresh groceries and kitchen essentials, we collect the following essential information to fulfill your purchase:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
                <li><strong>Identity Information:</strong> Your full name and account login credentials.</li>
                <li><strong>Contact Details:</strong> Mobile phone number, WhatsApp contact, and email address for order notifications and customer support.</li>
                <li><strong>Delivery Address:</strong> Kitchen/residence address, building/flat details, landmark, and postal pin code in Thrissur, Kerala.</li>
                <li><strong>Transaction Records:</strong> Ordered items, cart history, invoice totals, and Razorpay payment authorization transaction identifiers.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                2. Razorpay & Payment Data Security
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                All online digital payments (Credit/Debit Cards, UPI, Net Banking, and Wallets) on Green Basket TCR are processed securely by <strong>Razorpay Software Private Limited</strong>, an RBI-authorized and PCI-DSS Level 1 certified payment aggregator.
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                <strong>Green Basket TCR does not store or process your complete credit card numbers, CVVs, UPI MPINs, or online banking passwords</strong> on our servers. All sensitive financial authentication occurs within Razorpay's bank-grade encrypted payment gateway.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                3. How We Use Your Information
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
                <li>To process, hygienically pack, and deliver your grocery orders to your address.</li>
                <li>To send live order dispatch updates and digital invoices via WhatsApp or Email.</li>
                <li>To resolve customer service inquiries, handle refunds, and coordinate deliveries.</li>
                <li>To improve store navigation, website speed, and product recommendations.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                4. Cookies & Web Analytics
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                We use functional cookies and local browser storage strictly to remember your active shopping basket, preferred delivery time slots, and login sessions across page visits. You may choose to disable cookies in your web browser settings at any time.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                5. Data Protection & Grievance Officer
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                In accordance with the Information Technology Act 2000 and the Consumer Protection (E-Commerce) Rules 2020, our Grievance Officer can be contacted directly for any data privacy concerns:
              </p>
              <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200/80 space-y-1.5 text-xs sm:text-sm">
                <p className="font-bold text-gray-900">Grievance & Privacy Officer: Green Basket TCR</p>
                <p className="text-gray-600">Address: {address}</p>
                <p className="text-gray-600">Phone: {phone}</p>
                <p className="text-gray-600">
                  Email: <a href={`mailto:${email}`} className="text-gb-green font-bold underline">{email}</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
