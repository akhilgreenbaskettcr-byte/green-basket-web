import Link from "next/link";
import { NavLinks } from "./NavLinks";
import { CartIcon } from "./CartIcon";
import { SearchBar } from "./SearchBar";
import { MobileMenu } from "./MobileMenu";
import { UserNavIcon } from "./UserNavIcon";
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
            <UserNavIcon />
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
            <div className="flex items-center gap-1.5">
              <SearchBar />
              <UserNavIcon />
              <CartIcon />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
