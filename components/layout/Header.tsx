import Link from "next/link";
import { User } from "lucide-react";
import { NavLinks } from "./NavLinks";
import { CartIcon } from "./CartIcon";
import { SearchBar } from "./SearchBar";
import { MobileMenu } from "./MobileMenu";
import { Logo } from "@/components/ui/Logo";

export function Header() {
  return (
    <header className="site-header" role="banner">
      <div className="gb-container">
        {/* Desktop header */}
        <div className="hidden md:flex items-center h-16 gap-8">
          {/* Logo */}
          <Logo href="/" size="md" />

          {/* Nav — centered */}
          <div className="flex-1 flex justify-center">
            <NavLinks />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 shrink-0">
            <SearchBar />
            <Link
              href="/account"
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="My account"
            >
              <User size={20} className="text-gb-charcoal" aria-hidden="true" />
            </Link>
            <CartIcon />
          </div>
        </div>

        {/* Mobile header */}
        <div className="md:hidden">
          <div className="flex items-center justify-between h-14">
            {/* Hamburger */}
            <MobileMenu />

            {/* Logo */}
            <Logo href="/" size="sm" />

            {/* Right icons */}
            <div className="flex items-center gap-0.5">
              <Link
                href="/account"
                className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="My account"
              >
                <User size={18} className="text-gb-charcoal" aria-hidden="true" />
              </Link>
              <CartIcon />
            </div>
          </div>

          {/* Mobile search bar below */}
          <div className="pb-2.5">
            <form
              action="/categories"
              method="get"
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                name="q"
                placeholder="Search products..."
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
                aria-label="Search products"
              />
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
