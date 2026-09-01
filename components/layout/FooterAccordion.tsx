"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { Category } from "@/types/database";

interface FooterAccordionProps {
  categories: Category[];
  phone: string;
  email: string;
  address: string;
}

export function FooterAccordion({
  categories,
  phone,
  email,
  address,
}: FooterAccordionProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggle = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className="md:hidden space-y-2 pt-2">
      {/* 1. Shop Categories Accordion */}
      <div className="border border-gray-200/80 rounded-2xl bg-white overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggle("categories")}
          className="w-full flex items-center justify-between p-4 text-left font-bold text-xs uppercase tracking-wider text-gb-charcoal cursor-pointer"
          aria-expanded={openSection === "categories"}
        >
          <span className="text-gb-green font-mono">SHOP CATEGORIES</span>
          <ChevronDown
            size={16}
            className={`text-gray-500 transition-transform duration-200 ${
              openSection === "categories" ? "rotate-180 text-gb-green" : ""
            }`}
          />
        </button>

        {openSection === "categories" && (
          <div className="px-4 pb-4 pt-1 border-t border-gray-100">
            <ul className="space-y-2.5 text-xs">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-gray-600 hover:text-gb-green transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-gb-green" />
                    <span>{cat.name}</span>
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link
                  href="/categories"
                  className="text-gb-green font-bold hover:underline inline-block text-xs uppercase tracking-wide"
                >
                  VIEW ALL CATEGORIES →
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* 2. Quick Links Accordion */}
      <div className="border border-gray-200/80 rounded-2xl bg-white overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggle("links")}
          className="w-full flex items-center justify-between p-4 text-left font-bold text-xs uppercase tracking-wider text-gb-charcoal cursor-pointer"
          aria-expanded={openSection === "links"}
        >
          <span className="text-gb-green font-mono">QUICK LINKS</span>
          <ChevronDown
            size={16}
            className={`text-gray-500 transition-transform duration-200 ${
              openSection === "links" ? "rotate-180 text-gb-green" : ""
            }`}
          />
        </button>

        {openSection === "links" && (
          <div className="px-4 pb-4 pt-1 border-t border-gray-100">
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gb-green transition-colors">
                  HOME
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-600 hover:text-gb-green transition-colors">
                  ALL PRODUCTS
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gb-green transition-colors">
                  ABOUT US
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-600 hover:text-gb-green transition-colors">
                  HOW IT WORKS
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gb-green transition-colors">
                  CONTACT US
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-600 hover:text-gb-green transition-colors">
                  TRACK ORDER
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* 3. Razorpay Legal & Policies Accordion */}
      <div className="border border-gray-200/80 rounded-2xl bg-white overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggle("policies")}
          className="w-full flex items-center justify-between p-4 text-left font-bold text-xs uppercase tracking-wider text-gb-charcoal cursor-pointer"
          aria-expanded={openSection === "policies"}
        >
          <span className="text-gb-green font-mono">POLICIES & LEGAL</span>
          <ChevronDown
            size={16}
            className={`text-gray-500 transition-transform duration-200 ${
              openSection === "policies" ? "rotate-180 text-gb-green" : ""
            }`}
          />
        </button>

        {openSection === "policies" && (
          <div className="px-4 pb-4 pt-1 border-t border-gray-100">
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/shipping-policy" className="text-gray-600 hover:text-gb-green transition-colors">
                  SHIPPING & DELIVERY POLICY
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-gray-600 hover:text-gb-green transition-colors">
                  CANCELLATION & REFUND POLICY
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-600 hover:text-gb-green transition-colors">
                  PRIVACY POLICY
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="text-gray-600 hover:text-gb-green transition-colors">
                  TERMS & CONDITIONS
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* 4. Kitchen Concierge Accordion */}
      <div className="border border-gray-200/80 rounded-2xl bg-white overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggle("concierge")}
          className="w-full flex items-center justify-between p-4 text-left font-bold text-xs uppercase tracking-wider text-gb-charcoal cursor-pointer"
          aria-expanded={openSection === "concierge"}
        >
          <span className="text-gb-green font-mono">KITCHEN CONCIERGE</span>
          <ChevronDown
            size={16}
            className={`text-gray-500 transition-transform duration-200 ${
              openSection === "concierge" ? "rotate-180 text-gb-green" : ""
            }`}
          />
        </button>

        {openSection === "concierge" && (
          <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-3 text-xs">
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
              <p className="font-medium text-gray-800">{address || "Thrissur, Kerala, India"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
