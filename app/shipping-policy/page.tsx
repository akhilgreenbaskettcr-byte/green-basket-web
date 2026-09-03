import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/supabase/queries";
import { Truck, Clock, MapPin, ShieldCheck, HelpCircle, Phone, Mail } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy — Green Basket TCR",
  description:
    "Learn about our same-day delivery schedules, service areas in Thrissur, Kerala, shipping charges, and hygienic packaging standards.",
};

export default async function ShippingPolicyPage() {
  const settings = await getSiteSettings();
  const address = settings["contact_address"] ?? "Green Basket Tcr, Near Ayyanthole Ground, Thrissur, Kerala - 680003.";
  const cutoffTime = settings["same_day_cutoff_time"] ?? "1:00 PM";
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
                  Shipping Policy
                </li>
              </ol>
            </nav>

            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-gb-green text-[11px] font-bold uppercase tracking-wider mb-3 border border-emerald-200/60 shadow-2xs">
              DELIVERY INFORMATION
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gb-charcoal tracking-tight leading-tight uppercase mb-3">
              SHIPPING & <span style={{ color: "#245B35" }}>DELIVERY POLICY</span>
            </h1>

            <p className="text-gray-500 text-xs sm:text-sm md:text-base leading-relaxed">
              Last updated: September 1, 2026. Everything you need to know about how we deliver fresh vegetables, stone-ground spices, and traditional cold-pressed oils right to your kitchen in Thrissur.
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
                  <MapPin size={18} />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">SERVICE AREA</h2>
                <p className="text-xs text-gray-600 font-semibold">{address}</p>
                <p className="text-[11px] text-gray-400">Thrissur City & adjoining zones</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/70 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/60 text-gb-green flex items-center justify-center">
                  <Clock size={18} />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">NEXT-DAY DELIVERY</h2>
                <p className="text-xs text-gray-600 font-semibold">Order before {cutoffTime}</p>
                <p className="text-[11px] text-gray-400">Delivered fresh the next day</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/70 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/60 text-gb-green flex items-center justify-center">
                  <Truck size={18} />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">FREE SHIPPING</h2>
                <p className="text-xs text-gray-600 font-semibold">On orders above ₹500</p>
                <p className="text-[11px] text-gray-400">Available across Thrissur</p>
              </div>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                1. Service Area & Delivery Coverage
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Green Basket TCR operates direct doorstep deliveries across <strong>Thrissur, Kerala, India</strong>. We service residential kitchens, apartments, villas, and food establishments in Thrissur corporation limits and surrounding postal delivery pin codes.
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                If your delivery address is outside our primary coverage perimeter, our checkout system will notify you or our support team will contact you to arrange special scheduled dispatch.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                2. Delivery Slots & Timelines
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                <li>
                  <strong>Next-Day Delivery:</strong> Orders placed before <strong>{cutoffTime}</strong> (IST) from Monday through Sunday are prepped fresh and delivered to your doorstep the next day between 7:30 AM and 1:30 PM.
                </li>
                <li>
                  <strong>Direct Farm Sourcing:</strong> All vegetables and fruits are cut and packed in the early morning of the delivery day to guarantee field-fresh crispness.
                </li>
                <li>
                  <strong>Delivery Punctuality:</strong> Most orders within Thrissur are dispatched in temperature-controlled hygiene packaging and delivered on schedule.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                3. Shipping & Free Delivery
              </h2>
              <div className="bg-[#FAFAF5] p-4 sm:p-5 rounded-2xl border border-gray-200/80 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center py-1">
                  <span className="font-semibold text-gray-800">Orders of ₹500 and above:</span>
                  <span className="font-bold text-gb-green uppercase">FREE SHIPPING (₹0)</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500">
                Any applicable delivery charges are calculated transparently at checkout before payment. No hidden handling or packaging surcharges.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                4. Packaging & Quality Assurance
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Every order is hygienically prepped, graded, and packed on the delivery day in certified food-grade, leak-proof sealed containers. Cold-cut vegetables and fresh fruits are handled under temperature-controlled hygiene standards to preserve natural enzymes, taste, and nutrition.
              </p>
            </section>

            {/* Section 5: Delivery Inspection & Verification Policy */}
            <section className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                5. Delivery Inspection & Verification Policy
              </h2>
              <div className="bg-emerald-50/70 border-2 border-emerald-200/80 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={22} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wide">
                      Mandatory Delivery Handover Protocol
                    </h3>
                    <p className="text-xs text-emerald-800/90 mt-0.5">
                      To ensure total transparency and protect fresh food standards, please note our handover guidelines:
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

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gb-green" />
                6. Order Tracking & Delivery Support
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Upon placing your order, you will receive an instant order confirmation Email/WhatsApp with your tracking reference. Our delivery executive may call you upon arrival at your location.
              </p>
              <div className="bg-emerald-50/70 p-4 sm:p-5 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gb-green uppercase tracking-wide">
                    HAVE QUESTIONS REGARDING YOUR DISPATCH?
                  </p>
                  <p className="text-xs text-gray-600">
                    Contact our dispatch concierge directly:
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 text-xs font-bold w-full sm:w-auto">
                  <a
                    href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                    className="btn-primary text-xs px-4 py-2.5 inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-xs"
                  >
                    <Phone size={14} />
                    <span>Call {phone}</span>
                  </a>
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-gb-green hover:underline break-all sm:break-normal py-1"
                  >
                    <Mail size={14} className="shrink-0" />
                    <span>{email}</span>
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
