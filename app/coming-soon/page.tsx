import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { MessageCircle, Phone, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Green Basket TCR — Launching Soon",
  description: "Fresh farm produce and kitchen essentials in Thrissur. Launching soon!",
};

export default function ComingSoonPage() {
  const whatsappNumber = "919048178886";
  const whatsappMessage = encodeURIComponent(
    "Hello Green Basket TCR! I would like to know when you are launching."
  );

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-between items-center p-6 text-center font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top spacer */}
      <div className="w-full flex justify-end">
        <Link
          href="/admin/login"
          className="text-gray-300 hover:text-gray-600 transition-colors p-2"
          title="Admin"
        >
          <Lock size={14} />
        </Link>
      </div>

      {/* Main Minimal Card */}
      <main className="max-w-md w-full my-auto flex flex-col items-center space-y-6">
        {/* Brand Logo */}
        <Logo size="lg" priority />

        {/* Pulse Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-gb-green text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-gb-green animate-pulse" />
          <span>Launching Soon in Thrissur</span>
        </div>

        {/* Title & Short Tagline */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Something fresh is coming.
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
            Fresh farm vegetables, ready-to-cook cut produce & traditional Kerala essentials delivered to your doorstep.
          </p>
        </div>

        {/* Quick Contact Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-xs transition-all active:scale-98"
          >
            <MessageCircle size={16} />
            <span>WhatsApp Us</span>
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

      {/* Minimal Footer */}
      <footer className="text-[11px] text-gray-400 py-4">
        &copy; {new Date().getFullYear()} Green Basket TCR • Thrissur, Kerala
      </footer>
    </div>
  );
}
