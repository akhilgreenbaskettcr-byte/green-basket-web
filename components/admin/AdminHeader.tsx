"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  LayoutTemplate,
  Package,
  Tags,
  ShoppingBag,
  Users,
  Settings,
  MapPin,
  ExternalLink,
  LogOut,
  ChevronRight,
  Store,
  Grid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/home-editor", label: "Banners & Homepage", icon: LayoutTemplate },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/delivery-areas", label: "Delivery Areas", icon: MapPin },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Store Settings", icon: Settings },
];

const BOTTOM_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface AdminHeaderProps {
  userEmail?: string;
}

export function AdminHeader({ userEmail }: AdminHeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* ── Top Header Bar ── */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 shrink-0 sticky top-0 z-30 shadow-2xs">
        {/* Left: Mobile Hamburger & Logo */}
        <div className="flex items-center gap-2 lg:gap-0">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-gb-green hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Open admin navigation menu"
          >
            <Menu size={22} />
          </button>
          <div className="lg:hidden">
            <Logo href="/admin" size="sm" />
          </div>
          <div className="hidden lg:block">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 font-mono">
              Store Management Portal
            </span>
          </div>
        </div>

        {/* Right: Quick Links & Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gb-green font-semibold bg-emerald-50 hover:bg-emerald-100/80 px-2.5 py-1.5 rounded-xl border border-emerald-100 transition-colors"
            title="View Public Customer Store"
          >
            <Store size={14} />
            <span>Storefront</span>
            <ExternalLink size={12} className="opacity-60" />
          </Link>

          {userEmail && (
            <span className="hidden md:inline-block text-xs text-gray-500 font-medium truncate max-w-[180px]">
              {userEmail}
            </span>
          )}

          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </header>

      {/* ── Mobile Slide-Over Navigation Drawer ── */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-gb-green text-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-left duration-300 border-r border-white/10">
            <div>
              {/* Drawer Header with Logo & Close button */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="bg-white rounded-xl p-1.5 shadow-sm">
                  <Image
                    src="/images/logo/Green-basket-logo.png"
                    alt="Green Basket TCR"
                    width={180}
                    height={60}
                    className="h-8 w-auto object-contain select-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="p-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsDrawerOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all",
                        isActive
                          ? "bg-white text-gb-green font-bold shadow-sm"
                          : "text-white/85 hover:text-white hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={17} className="shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight size={14} className="opacity-40" />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/10 space-y-3">
              <Link
                href="/"
                target="_blank"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center justify-between text-xs text-white/90 hover:text-white transition-colors px-3 py-2.5 rounded-xl bg-white/10 font-bold"
              >
                <div className="flex items-center gap-2">
                  <Store size={15} />
                  <span>View Public Store</span>
                </div>
                <ExternalLink size={13} className="opacity-60" />
              </Link>

              {userEmail && (
                <p className="text-[11px] text-white/60 truncate font-mono px-1">
                  Logged in as {userEmail}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Bottom Navigation Bar (1-tap thumb navigation) ── */}
      <nav
        aria-label="Mobile Admin Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 py-1 px-2 flex items-center justify-around shadow-lg"
      >
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all",
                isActive
                  ? "text-gb-green"
                  : "text-gray-400 hover:text-gray-700"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-lg mb-0.5",
                  isActive ? "bg-emerald-50 text-gb-green" : ""
                )}
              >
                <Icon size={18} />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* More Button */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all",
            isDrawerOpen ? "text-gb-green" : "text-gray-400 hover:text-gray-700"
          )}
        >
          <div className="p-1 rounded-lg mb-0.5">
            <Grid size={18} />
          </div>
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
