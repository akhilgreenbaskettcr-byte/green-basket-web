"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LayoutTemplate,
  Package,
  Tags,
  ShoppingBag,
  Users,
  Settings,
  MapPin,
  ExternalLink,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Admin-only items (hidden from staff)
const ADMIN_ONLY_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/home-editor", label: "Banners & Homepage", icon: LayoutTemplate },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Store Settings", icon: Settings },
  { href: "/admin/staff", label: "Staff Management", icon: UserCog },
];

// Items visible to staff
const SHARED_ITEMS = [
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/delivery-areas", label: "Delivery Areas", icon: MapPin },
];

interface AdminSidebarProps {
  role: "admin" | "staff";
}

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems =
    role === "admin"
      ? [
          ADMIN_ONLY_ITEMS[0], // Dashboard
          ADMIN_ONLY_ITEMS[1], // Banners
          SHARED_ITEMS[0],     // Orders
          ADMIN_ONLY_ITEMS[2], // Products
          SHARED_ITEMS[1],     // Categories
          SHARED_ITEMS[2],     // Delivery Areas
          ADMIN_ONLY_ITEMS[3], // Customers
          ADMIN_ONLY_ITEMS[4], // Store Settings
          ADMIN_ONLY_ITEMS[5], // Staff Management
        ]
      : SHARED_ITEMS;

  return (
    <aside
      className="admin-sidebar flex flex-col hidden lg:flex shrink-0 w-64 bg-gb-green text-white min-h-screen border-r border-white/10"
      aria-label="Admin navigation"
    >
      {/* Logo Card Header */}
      <div className="p-5 border-b border-white/10">
        <Link href={role === "admin" ? "/admin" : "/admin/orders"} className="block group">
          <div className="bg-white rounded-2xl p-2.5 shadow-sm flex items-center justify-center transition-transform group-hover:scale-[1.02]">
            <Image
              src="/images/logo/Green-basket-logo.png"
              alt="Green Basket TCR"
              width={240}
              height={80}
              priority
              className="h-10 w-auto object-contain select-none"
            />
          </div>
        </Link>
        <div className="flex items-center justify-between mt-3 px-1">
          <span className="text-[10px] font-bold text-white/60 tracking-wider uppercase font-mono">
            {role === "admin" ? "Admin Workspace" : "Staff Workspace"}
          </span>
          <span className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-full",
            role === "admin"
              ? "bg-white/20 text-emerald-100"
              : "bg-amber-400/30 text-amber-100"
          )}>
            {role === "admin" ? "Admin" : "Staff"}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = (item as { exact?: boolean }).exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-white text-gb-green font-bold shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* View live store link */}
      <div className="p-4 border-t border-white/10">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between text-xs text-white/80 hover:text-white transition-colors px-3.5 py-2.5 rounded-xl hover:bg-white/10 font-semibold bg-white/5"
        >
          <span>View Public Store</span>
          <ExternalLink size={14} className="text-white/60" />
        </Link>
      </div>
    </aside>
  );
}
