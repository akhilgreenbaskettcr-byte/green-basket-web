import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/supabase/queries";
import { RefreshCcw, CheckCircle, Clock, HelpCircle, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy — Green Basket TCR",
  description:
    "Learn about our 100% freshness guarantee, cancellation window, and 5-7 day Razorpay refund process for fresh groceries and kitchen essentials.",
};

export default async function RefundPolicyPage() {
  const settings = await getSiteSettings();
  const address = settings["contact_address"] ?? "Green Basket Tcr, Near Ayyanthole Ground, Thrissur, Kerala - 680003.";
  const phone = settings["contact_phone"] ?? "+91 90481 78886";
  const email = settings["contact_email"] ?? "info@greenbaskettcr.com";
  const whatsapp = settings["whatsapp_number"] ?? "+919048178886";

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
                  Cancellation & Refund Policy
                </li>
              </ol>
            </nav>

            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-gb-green text-[11px] font-bold uppercase tracking-wider mb-3 border border-emerald-200/60 shadow-2xs">
              100% CUSTOMER SATISFACTION
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gb-charcoal tracking-tight leading-tight uppercase mb-3">
              CANCELLATION & <span style={{ color: "#245B35" }}>REFUND POLICY</span>
            </h1>

            <p className="text-gray-500 text-xs sm:text-sm md:text-base leading-relaxed">
              Last updated: September 1, 2026. At Green Basket TCR, our promise is simple: 100% fresh, hygienic Kerala kitchen essentials. If anything is not up to your standard, we make returns and refunds effortless.
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
                  <CheckCircle size={18} />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">FRESHNESS PROMISE</h2>
                <p className="text-xs text-gray-600 font-semibold">100% Quality Assured</p>
                <p className="text-[11px] text-gray-400">Immediate replacement or refund</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/70 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/60 text-gb-green flex items-center justify-center">
                  <Clock size={18} />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">REFUND TIMELINE</h2>
                <p className="text-xs text-gray-600 font-semibold">5 to 7 Business Days</p>
                <p className="text-[11px] text-gray-400">Credited to original payment mode</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/70 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/60 text-gb-green flex items-center justify-center">
                  <RefreshCcw size={18} />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">EASY CANCELLATIONS</h2>
                <p className="text-xs text-gray-600 font-semibold">Before Dispatch</p>
                <p className="text-[11px] text-gray-400">Zero penalty cancellation</p>
              </div>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                1. Order Cancellation Terms
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                <li>
                  <strong>Before Preparation & Dispatch:</strong> You can cancel your order free of charge before our preparation team starts cutting and packaging your fresh produce. Simply call or WhatsApp us at <strong>{phone}</strong> with your Order ID.
                </li>
                <li>
                  <strong>After Dispatch:</strong> Due to the perishable nature of freshly cut vegetables, grated coconut, and cold food preparations, orders that have already been dispatched out for delivery cannot be cancelled mid-transit.
                </li>
              </ul>
            </section>

            {/* Section 2: Delivery Inspection & Verification Policy */}
            <section className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                2. Delivery Inspection & Verification Policy
              </h2>
              <div className="bg-emerald-50/70 border-2 border-emerald-200/80 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={22} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wide">
                      Mandatory Handover Inspection
                    </h3>
                    <p className="text-xs text-emerald-800/90 mt-0.5">
                      Because our products consist of freshly cut perishable produce, please observe our verification policy:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                  <div className="bg-white p-4 rounded-xl border border-emerald-100/90 shadow-2xs space-y-1.5">
                    <p className="text-xs font-black text-gray-900 uppercase">1. On-the-Spot Inspection</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Customers are required to open and inspect their package in the presence of the delivery executive before they leave.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-emerald-100/90 shadow-2xs space-y-1.5">
                    <p className="text-xs font-black text-gray-900 uppercase">2. Finality of Delivery</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      We will not accept any claims, complaints, or requests for returns regarding incorrect items, missing items, or external package damage once the delivery executive has left your premises.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-emerald-100/90 shadow-2xs space-y-1.5">
                    <p className="text-xs font-black text-gray-900 uppercase">3. Immediate Resolution</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      If you notice any discrepancies or issues during this inspection at the time of delivery, please report it immediately to the delivery person and contact our support team.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Eligibility for Returns & Refunds */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                3. Eligibility for Returns & Refunds
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                When reported during the mandatory on-the-spot delivery inspection or within our freshness guarantee framework, we accept refund and replacement requests under:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
                <li><strong>Quality Discrepancy:</strong> The delivered fresh cut produce or fruits are spoiled, damaged, or substandard upon delivery.</li>
                <li><strong>Incorrect Item Delivered:</strong> You received a different product or weight variant than what you ordered.</li>
                <li><strong>Missing Items:</strong> An item from your order was missing in the delivery parcel.</li>
                <li><strong>Packaging Compromised:</strong> Damaged seal or leaked container during transit.</li>
              </ul>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/80 flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-700 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 leading-relaxed">
                  <strong>Freshness Guarantee:</strong> For internal quality concerns that cannot be diagnosed on external inspection, please report with photos to WhatsApp (<strong>{phone}</strong>) within <strong>24 hours of delivery</strong>.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                3. Refund Processing & Timelines (Razorpay)
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Once a refund is approved by our customer care team:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                <li>
                  <strong>Online Payments (Razorpay):</strong> The refund is initiated immediately into our Razorpay payment portal. The amount will be credited back directly to the original payment source (UPI ID, Debit Card, Credit Card, or Net Banking account) within <strong>5 to 7 business working days</strong> as per standard banking protocol.
                </li>
                <li>
                  <strong>Cash on Delivery (COD) / Direct UPI:</strong> Refunds will be transferred instantly via UPI (GPay, PhonePe, Paytm) to the customer's verified mobile number upon approval.
                </li>
                <li>
                  <strong>Instant Replacement:</strong> If preferred, we will immediately send a fresh replacement on our next scheduled delivery slot at zero additional charge.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                4. How to Request a Refund
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                To initiate a return or refund, please reach out to our customer care team with your Order ID:
              </p>
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200/80 space-y-2 text-xs sm:text-sm">
                <p>
                  <strong>WhatsApp Support:</strong>{" "}
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hello Green Basket! I would like to request assistance with my order.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gb-green font-bold underline"
                  >
                    {whatsapp} (Quickest response)
                  </a>
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a href={`mailto:${email}`} className="text-gb-green font-bold underline">
                    {email}
                  </a>
                </p>
                <p>
                  <strong>Phone Hotline:</strong>{" "}
                  <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="text-gray-900 font-bold">
                    {phone}
                  </a>
                </p>
                <p>
                  <strong>Service Center:</strong> {address}
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
