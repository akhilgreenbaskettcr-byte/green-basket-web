import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, ShoppingBag, ArrowRight, Truck, Phone, MessageCircle, ShieldCheck } from "lucide-react";
import { OrderSuccessTracker } from "@/components/order/OrderSuccessTracker";

export const metadata: Metadata = {
  title: "Order Confirmed — Green Basket TCR",
  description: "Your grocery order has been placed and confirmed successfully.",
};

interface Props {
  searchParams: Promise<{ order?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { order } = await searchParams;

  return (
    <>
      <OrderSuccessTracker orderNumber={order} />
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="min-h-screen bg-[#FBFBFA] flex items-center justify-center py-12 md:py-20">
        <div className="gb-container max-w-xl mx-auto px-4">
          <div className="bg-white rounded-3xl border border-gray-200/90 p-8 sm:p-10 text-center shadow-lg shadow-emerald-950/5 relative overflow-hidden">
            
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-gb-green via-emerald-400 to-gb-olive" />

            {/* Glowing Success Badge */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-6 shadow-md text-gb-green">
              <CheckCircle2 size={44} className="stroke-[2.2] animate-bounce" />
            </div>

            {/* Title */}
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100/80 text-gb-green text-xs font-bold uppercase tracking-wider mb-2">
              Payment & Order Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gb-charcoal tracking-tight mb-2 uppercase">
              Thank You For Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed mb-6">
              We have received your order and our team has started preparing your fresh ingredients with hygienic food-grade care.
            </p>

            {/* Order Number Box */}
            {order && (
              <div className="bg-[#FAFAF5] rounded-2xl border border-emerald-200/80 p-4 mb-5 inline-block w-full max-w-md">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Order Reference Number
                </p>
                <p className="text-xl sm:text-2xl font-black text-gb-green font-mono tracking-wider">
                  #{order}
                </p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-800 font-semibold mt-2 pt-2 border-t border-emerald-100">
                  <Truck size={14} className="text-gb-green" />
                  <span>Scheduled for Next-Day Delivery in Thrissur</span>
                </div>
              </div>
            )}

            {/* Delivery Inspection & Verification Reminder */}
            <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200/80 p-4 mb-6 text-left space-y-1 max-w-md mx-auto">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
                <span>Delivery Inspection Policy</span>
              </div>
              <p className="text-[11.5px] text-gray-600 leading-relaxed">
                <strong>On-the-Spot Inspection:</strong> Please open and inspect your package in the presence of our delivery executive before they leave. Claims regarding missing items, incorrect items, or external damage cannot be accepted once the delivery executive leaves your premises.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Link
                href="/categories"
                className="btn-primary inline-flex items-center justify-center gap-2 py-3 px-6 text-xs sm:text-sm font-bold uppercase tracking-wide"
              >
                <ShoppingBag size={16} />
                <span>Continue Shopping</span>
              </Link>
              <Link
                href="/account"
                className="btn-secondary inline-flex items-center justify-center gap-2 py-3 px-6 text-xs sm:text-sm font-bold uppercase tracking-wide"
              >
                <span>View Order History</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Support Footer */}
            <div className="pt-6 border-t border-gray-100 text-xs text-gray-500 space-y-2">
              <p className="font-medium text-gray-600">Need help or want to update your delivery instructions?</p>
              <div className="flex items-center justify-center gap-4 text-gb-green font-bold flex-wrap">
                <a href="tel:+919048178886" className="inline-flex items-center gap-1 hover:underline">
                  <Phone size={13} />
                  <span>+91 90481 78886</span>
                </a>
                <span className="text-gray-300">•</span>
                <a
                  href="https://wa.me/919048178886?text=Hi%20Green%20Basket,%20regarding%20my%20order"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-600 hover:underline"
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp Support</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
