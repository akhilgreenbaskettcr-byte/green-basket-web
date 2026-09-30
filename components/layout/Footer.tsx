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

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.301-.15-1.777-.877-2.052-.977-.276-.1-.477-.15-.678.15-.2.301-.778.977-.954 1.178-.175.201-.351.226-.652.076-.301-.151-1.27-.468-2.418-1.494-.894-.799-1.498-1.785-1.674-2.086-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.301.301-.501.1-.201.05-.376-.025-.526-.075-.151-.678-1.631-.93-2.235-.244-.588-.493-.509-.678-.518-.176-.008-.376-.01-.577-.01-.201 0-.527.075-.803.376-.276.301-1.054 1.03-1.054 2.511 0 1.481 1.079 2.91 1.23 3.111.15.201 2.122 3.24 5.141 4.544.718.31 1.28.495 1.718.634.724.23 1.382.198 1.902.12.58-.088 1.777-.727 2.028-1.43.251-.703.251-1.305.176-1.43-.076-.125-.277-.2-.578-.351zM12.042 0C5.398 0 .012 5.386.012 12.03c0 2.12.553 4.19 1.604 6.01L0 24l6.155-1.614a12.007 12.007 0 005.887 1.544h.005c6.643 0 12.03-5.387 12.03-12.032C24.077 5.386 18.686 0 12.042 0zm0 21.993h-.004c-1.8 0-3.567-.484-5.11-1.4l-.367-.218-3.799.997 1.014-3.705-.239-.38a9.98 9.98 0 01-1.536-5.257c0-5.518 4.49-10.008 10.046-10.008 2.684 0 5.207 1.046 7.106 2.946a10.006 10.006 0 012.936 7.07c-.001 5.519-4.49 10.01-10.046 10.01z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

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
  const footerDeliveryTitle =
    settings["footer_delivery_title"]?.trim() || "SAME DAY DELIVERY";
  const footerDeliveryDesc =
    settings["footer_delivery_desc"]?.trim() || `Order before ${sameDayCutoff}`;
  const footerOrderCutoffText =
    settings["footer_order_cutoff_text"]?.trim() ||
    `Same-Day delivery for orders before ${sameDayCutoff}`;

  const cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, "");

  return (
    <footer
      className="bg-[#FAFAF5] text-gb-charcoal border-t border-gray-200/70"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Top Value Proposition Strip */}
      <div className="border-b border-gray-200/50 bg-white/60 py-5 sm:py-6">
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
                {footerDeliveryTitle}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 pl-3">
                {footerDeliveryDesc}
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
      <div className="gb-container py-7 sm:py-8 lg:py-9">
        {/* DESKTOP VIEW: Multi-Column Grid */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Column 1: Official Logo & Brand Info (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div className="inline-block">
              <Logo href="/" size="lg" />
            </div>

            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-sm">
              Your Kitchen, Simplified. Freshly cut vegetables, cold-pressed traditional oils, and stone-ground spices prepared with authentic Kerala care.
            </p>

            {/* Quick WhatsApp & Social Logo Icons */}
            <div className="pt-1 flex items-center gap-2.5">
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent("Hello Green Basket! I'd like to place an order.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-xs uppercase tracking-wide cursor-pointer hover:scale-102"
              >
                <WhatsAppIcon className="w-4 h-4 text-black shrink-0" />
                <span>WhatsApp Quick Order</span>
              </a>

              {/* Instagram Icon */}
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:text-white bg-white hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] border border-gray-200/80 hover:border-transparent transition-all shadow-2xs hover:shadow-xs hover:scale-105"
                aria-label="Instagram"
                title="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>

              {/* Facebook Icon */}
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:text-white bg-white hover:bg-[#1877F2] border border-gray-200/80 hover:border-transparent transition-all shadow-2xs hover:shadow-xs hover:scale-105"
                aria-label="Facebook"
                title="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Shop Categories (3 cols) */}
          <div className="md:col-span-3 space-y-3.5 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gb-green" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gb-green font-mono">
                SHOP CATEGORIES
              </h3>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform"
                  >
                    <span>{cat.name}</span>
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link
                  href="/categories"
                  className="text-gb-green hover:text-gb-green-dark font-bold text-xs inline-flex items-center gap-1 mt-0.5 uppercase tracking-wide group"
                >
                  <span>VIEW ALL CATEGORIES</span>
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links & Policies (2 cols) */}
          <div className="md:col-span-2 space-y-3.5 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gb-green" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gb-green font-mono">
                QUICK LINKS
              </h3>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="text-gray-600 hover:text-gb-green transition-colors block hover:translate-x-1 transition-transform">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Kitchen Concierge Card (3 cols) */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-2xs space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gb-green font-mono">
                  KITCHEN CONCIERGE
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-3 text-xs">
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
                    <p className="font-medium text-gray-800">{footerOrderCutoffText}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE VIEW: Brand info + Interactive Accordions */}
        <div className="md:hidden space-y-5">
          <div className="space-y-3">
            <Logo href="/" size="md" />
            <p className="text-gray-600 text-xs leading-relaxed">
              Your Kitchen, Simplified. Freshly cut vegetables, cold-pressed traditional oils, and stone-ground spices prepared with authentic Kerala care.
            </p>
            <div className="pt-1 flex items-center gap-2.5">
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent("Hello Green Basket! I'd like to place an order.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-black font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs uppercase tracking-wide"
              >
                <WhatsAppIcon className="w-4 h-4 text-black shrink-0" />
                <span>WhatsApp Order</span>
              </a>
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-700 bg-white border border-gray-200/80 shadow-2xs"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-700 bg-white border border-gray-200/80 shadow-2xs"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          <FooterAccordion
            categories={categories}
            phone={phone}
            email={email}
            address={address}
            orderCutoffText={footerOrderCutoffText}
          />
        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="border-t border-gray-200/60 py-4 sm:py-5 text-xs text-gray-500 bg-white/50">
        <div className="gb-container flex flex-col items-center justify-center gap-1.5 text-center">
          <p className="text-[11.5px] sm:text-xs text-gray-500 font-medium tracking-tight">
            © {new Date().getFullYear()} GREEN BASKET TCR. ALL RIGHTS RESERVED.
          </p>
          <p className="text-[11px] sm:text-[11.5px] text-gray-400 font-medium tracking-wide">
            CRAFTED BY{" "}
            <a
              href="https://ekodrix.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-gray-800 hover:text-gb-green transition-colors underline decoration-gray-300 hover:decoration-gb-green"
            >
              EKODRIX
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
