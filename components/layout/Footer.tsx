import Link from "next/link";
import { getSiteSettings, getActiveCategories } from "@/lib/supabase/queries";
import { Logo } from "@/components/ui/Logo";
import { FooterAccordion } from "./FooterAccordion";

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
      className="bg-[#FAFAF5] text-gb-charcoal border-t border-gray-200/70"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Top Value Proposition Strip — Clean Minimalist Typography */}
      <div className="border-b border-gray-200/50 bg-white/60 py-6 sm:py-7">
        <div className="gb-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-left space-y-1">
              <p className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-gb-green shrink-0" />
                100% FARM FRESH
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 pl-3">
                Direct from Kerala growers
              </p>
            </div>

            <div className="text-left space-y-1">
              <p className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-gb-green shrink-0" />
                HYGIENIC COLD CUT
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 pl-3">
                Cleaned & ready to cook
              </p>
            </div>

            <div className="text-left space-y-1">
              <p className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-gb-green shrink-0" />
                SAME DAY DELIVERY
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 pl-3">
                Order before {sameDayCutoff}
              </p>
            </div>

            <div className="text-left space-y-1">
              <p className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5 uppercase">
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
                className="text-xs font-semibold text-gray-500 hover:text-gb-green px-2 py-1 transition-colors uppercase"
                aria-label="Instagram"
              >
                Instagram
              </a>

              {/* Facebook */}
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-gray-500 hover:text-gb-green px-2 py-1 transition-colors uppercase"
                aria-label="Facebook"
              >
                Facebook
              </a>
            </div>
          </div>

          {/* Column 2: Categories (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gb-green font-mono">
              SHOP CATEGORIES
            </p>
            <ul className="space-y-2 text-xs sm:text-sm">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-gray-600 hover:text-gb-green transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-gb-green transition-colors" />
                    <span>{cat.name}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/categories"
                  className="text-gb-green hover:underline font-bold text-xs inline-flex items-center gap-1 mt-1 uppercase"
                >
                  VIEW ALL CATEGORIES →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gb-green font-mono">
              QUICK LINKS
            </p>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gb-green transition-colors uppercase">
                  HOME
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-600 hover:text-gb-green transition-colors uppercase">
                  ALL PRODUCTS
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gb-green transition-colors uppercase">
                  ABOUT US
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-600 hover:text-gb-green transition-colors uppercase">
                  HOW IT WORKS
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gb-green transition-colors uppercase">
                  CONTACT
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-600 hover:text-gb-green transition-colors uppercase">
                  TRACK ORDER
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Kitchen Concierge Card (3 cols) */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-2xs space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gb-green font-mono">
                KITCHEN CONCIERGE
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">CALL / WHATSAPP</p>
                  <a
                    href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                    className="font-bold text-gray-900 hover:text-gb-green transition-colors text-sm"
                  >
                    {phone}
                  </a>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">SUPPORT EMAIL</p>
                  <a
                    href={`mailto:${email}`}
                    className="font-medium text-gray-800 hover:text-gb-green transition-colors"
                  >
                    {email}
                  </a>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">SERVICE AREA</p>
                  <p className="font-medium text-gray-800">{address}</p>
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

      {/* Bottom Sub-footer */}
      <div className="border-t border-gray-200/60 py-6 text-xs text-gray-500">
        <div className="gb-container flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} GREEN BASKET TCR. ALL RIGHTS RESERVED.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 text-gray-500">
            <span className="uppercase">FRESH KERALA FOOD ESSENTIALS</span>
            <span>•</span>
            <span>
              CRAFTED BY{" "}
              <a
                href="https://ekodrix.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-gray-800 hover:text-gb-green transition-colors underline decoration-gray-300 hover:decoration-gb-green"
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
