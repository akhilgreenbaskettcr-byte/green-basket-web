import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/supabase/queries";
import { Scale, FileCheck, AlertCircle, HelpCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Terms & Conditions — Green Basket TCR",
  description:
    "Read the terms and conditions governing the purchase of fresh groceries, payment processing via Razorpay, and delivery services by Green Basket TCR.",
};

export default async function TermsAndConditionsPage() {
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
                  Terms & Conditions
                </li>
              </ol>
            </nav>

            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-gb-green text-[11px] font-bold uppercase tracking-wider mb-3 border border-emerald-200/60 shadow-2xs">
              LEGAL AGREEMENT
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gb-charcoal tracking-tight leading-tight uppercase mb-3">
              TERMS & <span style={{ color: "#245B35" }}>CONDITIONS</span>
            </h1>

            <p className="text-gray-500 text-xs sm:text-sm md:text-base leading-relaxed">
              Last updated: September 1, 2026. Please read these terms carefully before using or placing an order on Green Basket TCR ("greenbasket.in").
            </p>
          </div>
        </div>

        {/* Policy Content */}
        <div className="gb-container max-w-4xl pt-10">
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-10 shadow-2xs space-y-10 text-gb-charcoal">
            {/* Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-gray-100">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/70 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/60 text-gb-green flex items-center justify-center">
                  <FileCheck size={18} />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">USER AGREEMENT</h2>
                <p className="text-xs text-gray-600 font-semibold">Binding Terms of Sale</p>
                <p className="text-[11px] text-gray-400">Applicable to all store orders</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/70 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/60 text-gb-green flex items-center justify-center">
                  <Scale size={18} />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">JURISDICTION</h2>
                <p className="text-xs text-gray-600 font-semibold">Thrissur, Kerala</p>
                <p className="text-[11px] text-gray-400">Governed by Laws of India</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/70 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/60 text-gb-green flex items-center justify-center">
                  <AlertCircle size={18} />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">PAYMENTS</h2>
                <p className="text-xs text-gray-600 font-semibold">Razorpay Verified</p>
                <p className="text-[11px] text-gray-400">100% Safe Online Checkout</p>
              </div>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                1. Overview & Acceptance of Terms
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                This document is an electronic record in terms of Information Technology Act, 2000. By accessing, browsing, or purchasing on <strong>Green Basket TCR</strong>, you agree to be legally bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our website or services.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                2. Products, Weights & Fresh Produce Pricing
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                <li>
                  <strong>Fresh Produce Weight Tolerance:</strong> As vegetables and fresh fruits naturally lose moisture and vary in natural size, a slight weight variation of up to ±5% may occur during cutting, packaging, and same-day transit.
                </li>
                <li>
                  <strong>Pricing Accuracy:</strong> All prices listed on the website are in Indian Rupees (INR) and inclusive of applicable taxes. Prices may change based on daily wholesale farm market rates in Kerala without prior notice.
                </li>
                <li>
                  <strong>Authenticity Guarantee:</strong> Our curry powders, masalas, and cold-pressed oils are 100% stone-ground and cold-pressed with zero artificial adulterants or synthetic coloring agents.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                3. Payment Methods & Razorpay Gateway
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                We accept payments via <strong>Razorpay Payment Gateway</strong> (UPI, Google Pay, PhonePe, Paytm, Debit Cards, Credit Cards, Net Banking, and Authorized Digital Wallets). By initiating a transaction, you confirm that you are authorized to use the chosen payment method.
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                If a transaction is flagged as suspicious by our automated fraud detection filters or Razorpay's risk control algorithms, we reserve the right to decline or cancel the order.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                4. Order Fulfillment & Right to Refuse
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                While we make every effort to maintain real-time inventory, availability of seasonal farm produce is subject to daily harvest conditions. In the rare event an item is out of stock, we will notify you immediately and issue a 100% full refund for the unavailable item.
              </p>
            </section>

            {/* Section 5: Delivery Inspection & Handover Protocol */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                5. Delivery Inspection & Handover Policy
              </h2>
              <div className="bg-emerald-50/70 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 space-y-2.5 text-xs sm:text-sm">
                <p className="text-gray-700 leading-relaxed">
                  <strong>On-the-Spot Inspection:</strong> Customers are required to open and inspect their package in the presence of the delivery executive before they leave.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Finality of Delivery:</strong> We will not accept any claims, complaints, or requests for returns regarding incorrect items, missing items, or external package damage once the delivery executive has left your premises.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Immediate Resolution:</strong> If you notice any discrepancies or issues during this inspection at the time of delivery, please report it immediately to the delivery person and contact our customer support team.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                6. Intellectual Property
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                The Green Basket TCR brand name, logo, graphic designs, product photography, text content, and website software are the exclusive intellectual property of Green Basket TCR. Unauthorized reproduction, scraping, or commercial misuse is strictly prohibited.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                7. Governing Law & Dispute Resolution
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                These terms are governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of or related to our services shall be subject to the exclusive jurisdiction of the competent courts in <strong>Thrissur, Kerala, India</strong>.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                8. Contact Information
              </h2>
              <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200/80 space-y-1.5 text-xs sm:text-sm">
                <p className="font-bold text-gray-900">Green Basket TCR</p>
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
