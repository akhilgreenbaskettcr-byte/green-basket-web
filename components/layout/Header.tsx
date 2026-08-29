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
        <div className="hidden md:flex items-center h-16 gap-6 lg:gap-8">
          {/* Logo */}
          <Logo href="/" size="md" />

          {/* Nav — centered */}
          <div className="flex-1 flex justify-center">
            <NavLinks />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <SearchBar />
            <Link
              href="/account"
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="My account"
            >
              <User size={19} className="text-gb-charcoal" aria-hidden="true" />
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
            <div className="flex items-center gap-1">
              <SearchBar />
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
        </div>
      </div>
    </header>
  );
}
