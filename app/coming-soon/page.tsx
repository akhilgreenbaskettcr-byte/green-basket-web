import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { MessageCircle, Phone, Lock, Calendar, Clock, Sparkles, ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "Launching Soon — Green Basket TCR",
  description:
    "Green Basket TCR officially launches on Wednesday, 23rd September 2026. Ordering opens Tuesday, 22nd September from 7:00 AM to 1:00 PM.",
};

export default function ComingSoonPage() {
  const whatsappNumber = "919048178886";
  const whatsappMessage = encodeURIComponent(
    "Hello Green Basket TCR! I would like to know more about the launch on Wednesday 23rd."
  );

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between items-center p-4 sm:p-6 text-center font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top bar with subtle admin link */}
      <div className="w-full flex justify-end">
        <Link
          href="/admin/login"
          className="text-gray-300 hover:text-gray-600 transition-colors p-2"
          title="Staff & Admin Portal"
        >
          <Lock size={14} />
        </Link>
      </div>

      {/* Main Content Card */}
      <main className="max-w-lg w-full my-auto flex flex-col items-center space-y-6 py-4">
        {/* Brand Logo */}
        <Logo size="lg" priority />

        {/* Pulse Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-gb-green text-xs font-bold uppercase tracking-wider shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-gb-green animate-pulse" />
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500" />
            Grand Launch Announcement
          </span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Something Fresh is Coming.
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
            Fresh farm vegetables, ready-to-cook cut produce & traditional Kerala essentials delivered straight to your kitchen in Thrissur.
          </p>
        </div>

        {/* Schedule Highlight Box */}
        <div className="w-full bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-sm space-y-4 text-left">
          {/* Launch Date */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <div className="w-10 h-10 rounded-xl bg-gb-green text-white flex items-center justify-center shrink-0 shadow-xs">
              <Calendar size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Official Launch
              </span>
              <h3 className="text-sm sm:text-base font-black text-gray-900">
                Wednesday, 23rd September 2026
              </h3>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Our service officially goes live across Thrissur!
              </p>
            </div>
          </div>

          {/* Ordering Timing */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Clock size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                Pre-Orders Begin
              </span>
              <h3 className="text-sm sm:text-base font-black text-gray-900">
                Tuesday, 22nd September 2026
              </h3>
              <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                <ShoppingBag size={12} />
                <span>Ordering Hours: 7:00 AM – 1:00 PM</span>
              </div>
              <p className="text-[11px] text-gray-600 mt-1">
                Place your orders during this morning window for fresh delivery on launch day.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Contact Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-1">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-xs transition-all active:scale-98"
          >
            <MessageCircle size={16} />
            <span>WhatsApp Enquiry</span>
          </a>

          <a
            href="tel:+919048178886"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold text-xs py-3 px-5 rounded-xl transition-colors shadow-2xs"
          >
            <Phone size={14} className="text-gb-green" />
            <span>+91 90481 78886</span>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-[11px] text-gray-400 py-3">
        &copy; {new Date().getFullYear()} Green Basket TCR • Thrissur, Kerala
      </footer>
    </div>
  );
}
