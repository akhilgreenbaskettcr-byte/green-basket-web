import Link from "next/link";
import { getSiteSettings, getActiveCategories } from "@/lib/supabase/queries";
import { Logo } from "@/components/ui/Logo";
import { FooterAccordion } from "./FooterAccordion";
import {
  Sprout,
  Scissors,
  Truck,
  ShieldCheck,
  PhoneCall,
  Mail,
  MapPin,
  ArrowUpRight,
  MessageCircle,
} from "lucide-react";

export async function Footer() {
  const settings = await getSiteSettings();
  const categories = await getActiveCategories();

  const phone = settings["contact_phone"] ?? "+91 98765 43210";
  const email = settings["contact_email"] ?? "hello@greenbasket.in";
  const address = settings["contact_address"] ?? "Ernakulam, Kerala, India";
  const whatsappNumber = settings["whatsapp_number"] ?? "+919876543210";
  const instagram = settings["instagram_url"] ?? "https://instagram.com/greenbasketin";
  const facebook = settings["facebook_url"] ?? "https://facebook.com/greenbasketin";
  const sameDayCutoff = settings["same_day_cutoff_time"] ?? "1:00 PM";

  const cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, "");

  return (
    <footer
      className="bg-[#FAFAF5] text-gb-charcoal border-t border-gray-200/80"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Top Value Proposition Strip */}
      <div className="border-b border-gray-200/70 bg-[#F4F4EA]/80 py-8">
        <div className="gb-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gb-green/10 text-gb-green flex items-center justify-center shrink-0 mt-0.5">
                <Sprout size={18} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-bold text-gb-charcoal uppercase tracking-wider font-mono">
                  100% Farm Fresh
                </p>
                <p className="text-xs text-gray-500">Direct from Kerala growers</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gb-green/10 text-gb-green flex items-center justify-center shrink-0 mt-0.5">
                <Scissors size={18} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-bold text-gb-charcoal uppercase tracking-wider font-mono">
                  Hygienic Cold Cut
                </p>
                <p className="text-xs text-gray-500">Cleaned & ready to cook</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gb-green/10 text-gb-green flex items-center justify-center shrink-0 mt-0.5">
                <Truck size={18} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-bold text-gb-charcoal uppercase tracking-wider font-mono">
                  Same Day Delivery
                </p>
                <p className="text-xs text-gray-500">Order before {sameDayCutoff}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gb-green/10 text-gb-green flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={18} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-bold text-gb-charcoal uppercase tracking-wider font-mono">
                  Zero Preservatives
                </p>
                <p className="text-xs text-gray-500">100% pure authentic produce</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content Body */}
      <div className="gb-container pt-16 sm:pt-20 lg:pt-24 pb-14 sm:pb-16 lg:pb-20">
        {/* DESKTOP VIEW */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 lg:gap-12 items-start pt-2">
          {/* Column 1: Official Logo & Brand Info (4 cols) */}
          <div className="md:col-span-4 space-y-5">
            <div className="inline-block">
              <Logo href="/" size="lg" />
            </div>

            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-sm">
              Your Kitchen, Simplified. Freshly cut vegetables, cold-pressed traditional oils, and stone-ground spices prepared with authentic Kerala care.
            </p>

            {/* Quick WhatsApp & Socials */}
            <div className="pt-2 flex flex-col gap-3">
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent("Hello Green Basket! I'd like to place an order.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs px-4 py-3 rounded-xl transition-all shadow-xs hover:shadow-md uppercase tracking-wider w-fit"
              >
                <MessageCircle size={16} fill="black" className="text-black shrink-0" />
                <span>WhatsApp Quick Order</span>
              </a>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gb-green bg-white hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200/80 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-3.5 h-3.5 text-pink-600 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span>Instagram</span>
                </a>

                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gb-green bg-white hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200/80 transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-3.5 h-3.5 text-blue-600 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.592 9 4.815V8z" />
                  </svg>
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Shop Categories (3 cols) */}
          <div className="md:col-span-3 space-y-4 pt-3 sm:pt-4">
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

          {/* Column 3: Quick Links (2 cols) */}
          <div className="md:col-span-2 space-y-4 pt-3 sm:pt-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gb-green" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gb-green font-mono">
                QUICK LINKS
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Kitchen Concierge Card (3 cols) */}
          <div className="md:col-span-3 pt-3 sm:pt-4">
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
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE VIEW */}
        <div className="md:hidden space-y-6">
          <div className="space-y-3">
            <Logo href="/" size="md" />
            <p className="text-gray-600 text-xs leading-relaxed">
              Your Kitchen, Simplified. Freshly cut vegetables, cold-pressed traditional oils, and stone-ground spices prepared with authentic Kerala care.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent("Hello Green Basket! I'd like to place an order.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-black font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs uppercase tracking-wide"
              >
                <MessageCircle size={15} fill="black" />
                <span>WhatsApp Order</span>
              </a>
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200">
                Instagram
              </a>
              <a href={facebook} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200">
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

      {/* Bottom Sub-footer */}
      <div className="border-t border-gray-200/80 py-7 text-xs text-gray-500 bg-white/40">
        <div className="gb-container flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} GREEN BASKET TCR. ALL RIGHTS RESERVED.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 text-gray-500">
            <span className="uppercase tracking-wider font-mono text-[11px]">FRESH KERALA FOOD ESSENTIALS</span>
            <span>•</span>
            <span className="font-medium">
              CRAFTED BY{" "}
              <a
                href="https://ekodrix.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-gray-900 hover:text-gb-green transition-colors underline decoration-gray-300 hover:decoration-gb-green"
              >
                EKODRIX
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
