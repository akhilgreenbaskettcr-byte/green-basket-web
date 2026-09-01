import Link from "next/link";
import { getSiteSettings, getActiveCategories } from "@/lib/supabase/queries";
import { Logo } from "@/components/ui/Logo";
import { FooterAccordion } from "./FooterAccordion";
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  ArrowUpRight,
} from "lucide-react";

export async function Footer() {
  const settings = await getSiteSettings();
  const categories = await getActiveCategories();

  const phone = settings["contact_phone"] ?? "+91 90481 78886";
  const email = settings["contact_email"] ?? "info@greenbaskettcr.com";
  const address = settings["contact_address"] ?? "Green Basket Tcr, Near Ayyanthole Ground, Thrissur, Kerala - 680003.";
  const whatsappNumber = settings["whatsapp_number"] ?? "+919048178886";
  const instagram = settings["instagram_url"] ?? "https://www.instagram.com/greenbaskettcr?igsi=MWR2aGZja3Z0dXB6OA==";
  const facebook = settings["facebook_url"] ?? "https://www.facebook.com/share/1D6LKpc5Rx/";
  const sameDayCutoff = settings["same_day_cutoff_time"] ?? "1:00 PM";

  const cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, "");

  return (
    <footer
      className="bg-[#FAFAF5] text-gb-charcoal border-t border-gray-200/70"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Top Value Proposition Strip */}
      <div className="border-b border-gray-200/50 bg-white/60 py-6 sm:py-7">
        <div className="gb-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-left space-y-1">
              <p className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-gb-green shrink-0" />
                100% FARM FRESH
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 pl-3">
                Direct from Kerala growers
              </p>
            </div>

            <div className="text-left space-y-1">
              <p className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-gb-green shrink-0" />
                HYGIENIC COLD CUT
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 pl-3">
                Cleaned & ready to cook
              </p>
            </div>

            <div className="text-left space-y-1">
              <p className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-gb-green shrink-0" />
                NEXT DAY DELIVERY
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 pl-3">
                Order before {sameDayCutoff}
              </p>
            </div>

            <div className="text-left space-y-1">
              <p className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase tracking-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-gb-green shrink-0" />
                ZERO PRESERVATIVES
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 pl-3">
                100% pure authentic produce
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="gb-container py-10 sm:py-12 lg:py-14">
        {/* DESKTOP VIEW: Multi-Column Grid (Untouched) */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Column 1: Official Logo & Brand Info (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div className="inline-block">
              <Logo href="/" size="lg" />
            </div>

            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-sm">
              Your Kitchen, Simplified. Freshly cut vegetables, cold-pressed traditional oils, and stone-ground spices prepared with authentic Kerala care.
            </p>

            {/* Quick WhatsApp & Socials */}
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent("Hello Green Basket! I'd like to place an order.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs uppercase tracking-wide"
              >
                <span>WhatsApp Quick Order</span>
              </a>

              {/* Instagram */}
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gb-green bg-white hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200/80 transition-colors uppercase"
                aria-label="Instagram"
              >
                <span>Instagram</span>
              </a>

              {/* Facebook */}
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gb-green bg-white hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200/80 transition-colors uppercase"
                aria-label="Facebook"
              >
                <span>Facebook</span>
              </a>
            </div>
          </div>

          {/* Column 2: Shop Categories (3 cols) */}
          <div className="md:col-span-3 space-y-4 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gb-green" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gb-green font-mono">
                SHOP CATEGORIES
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-gray-600 hover:text-gb-green transition-all inline-flex items-center gap-2 group hover:translate-x-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-gb-green transition-colors" />
                    <span>{cat.name}</span>
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link
                  href="/categories"
                  className="text-gb-green hover:text-gb-green-dark font-bold text-xs inline-flex items-center gap-1 mt-1 uppercase tracking-wide group"
                >
                  <span>VIEW ALL CATEGORIES</span>
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links & Policies (2 cols) */}
          <div className="md:col-span-2 space-y-4 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gb-green" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gb-green font-mono">
                QUICK LINKS
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform uppercase">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform uppercase">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform uppercase">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform uppercase">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform uppercase">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform uppercase">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform uppercase">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Kitchen Concierge Card (3 cols) */}
          <div className="md:col-span-3 pt-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-200/90 shadow-2xs space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gb-green font-mono">
                  KITCHEN CONCIERGE
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <PhoneCall size={15} className="text-gb-green shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">CALL / WHATSAPP</p>
                    <a
                      href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                      className="font-bold text-gb-charcoal hover:text-gb-green transition-colors text-sm"
                    >
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Mail size={15} className="text-gb-green shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">SUPPORT EMAIL</p>
                    <a
                      href={`mailto:${email}`}
                      className="font-medium text-gray-800 hover:text-gb-green transition-colors"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-gb-green shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">SERVICE AREA</p>
                    <p className="font-medium text-gray-800">{address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock size={15} className="text-gb-green shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">ORDER CUTOFF</p>
                    <p className="font-medium text-gray-800">Next-Day delivery before {sameDayCutoff}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE VIEW: Brand info + Interactive Accordions */}
        <div className="md:hidden space-y-6">
          <div className="space-y-3">
            <Logo href="/" size="md" />
            <p className="text-gray-600 text-xs leading-relaxed">
              Your Kitchen, Simplified. Freshly cut vegetables, cold-pressed traditional oils, and stone-ground spices prepared with authentic Kerala care.
            </p>
            <div className="pt-1 flex items-center gap-3">
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent("Hello Green Basket! I'd like to place an order.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-black font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs uppercase tracking-wide"
              >
                <span>WhatsApp Order</span>
              </a>
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-gray-500 uppercase">
                Instagram
              </a>
              <a href={facebook} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-gray-500 uppercase">
                Facebook
              </a>
            </div>
          </div>

          <FooterAccordion
            categories={categories}
            phone={phone}
            email={email}
            address={address}
          />
        </div>
      </div>

      {/* Bottom Sub-footer with Razorpay Mandatory Policy Links */}
      <div className="border-t border-gray-200/60 py-6 text-xs text-gray-500 bg-white/40">
        <div className="gb-container flex flex-col lg:flex-row items-center justify-between gap-4 text-center lg:text-left">
          <div className="space-y-1">
            <p>© {new Date().getFullYear()} GREEN BASKET TCR. ALL RIGHTS RESERVED.</p>
            <p className="text-[11px] text-gray-400">
              Fresh Kerala Groceries Delivered Across Thrissur, Kerala.
            </p>
          </div>

          {/* Policy Links Bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-semibold text-gray-600">
            <Link href="/shipping-policy" className="hover:text-gb-green transition-colors uppercase">
              Shipping Policy
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/refund-policy" className="hover:text-gb-green transition-colors uppercase">
              Refund Policy
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/privacy-policy" className="hover:text-gb-green transition-colors uppercase">
              Privacy Policy
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/terms-and-conditions" className="hover:text-gb-green transition-colors uppercase">
              Terms & Conditions
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/contact" className="hover:text-gb-green transition-colors uppercase">
              Contact Us
            </Link>
          </div>

          {/* Ekodrix Credit */}
          <div className="text-[11px] text-gray-500 shrink-0">
            CRAFTED BY{" "}
            <a
              href="https://ekodrix.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-gray-800 hover:text-gb-green transition-colors underline decoration-gray-300 hover:decoration-gb-green"
            >
              EKODRIX
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
