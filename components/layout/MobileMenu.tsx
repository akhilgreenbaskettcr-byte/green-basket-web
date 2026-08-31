"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronRight, LogIn, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/utils/supabase/client";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About Us" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Contact" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* Hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        <Menu size={22} className="text-gb-charcoal" aria-hidden="true" />
      </button>

      {/* Drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[200]"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          id="mobile-menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div onClick={() => setOpen(false)}>
                <Logo href="/" size="sm" />
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close navigation menu"
              >
                <X size={18} className="text-gray-500" aria-hidden="true" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              <ul role="list" className="space-y-1">
                {NAV_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-colors",
                        pathname === href
                          ? "bg-green-50 text-gb-green font-semibold"
                          : "text-gb-charcoal hover:bg-gray-50"
                      )}
                    >
                      <span>{label}</span>
                      <ChevronRight
                        size={16}
                        className={
                          pathname === href ? "text-gb-green" : "text-gray-300"
                        }
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}

                {/* Auth section — divider */}
                <li className="pt-2">
                  <div className="border-t border-gray-100 mb-2" />
                  {user ? (
                    <>
                      {/* Logged-in: Profile info */}
                      <div className="px-3 py-2 mb-1">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gb-green text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {(user.user_metadata?.full_name || user.email || "U").charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gb-charcoal truncate max-w-[160px]">
                              {user.user_metadata?.full_name || user.email}
                            </p>
                            <p className="text-[10px] text-gray-400">Signed in</p>
                          </div>
                        </div>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-gb-green hover:bg-green-50 transition-colors"
                      >
                        <User size={16} />
                        My Profile & Orders
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors text-left mt-0.5"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-semibold text-gb-green bg-green-50/60 hover:bg-green-50 transition-colors"
                    >
                      <LogIn size={16} />
                      <span>Login / Create Account</span>
                    </Link>
                  )}
                </li>
              </ul>
            </nav>

            {/* Bottom info */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500 font-medium">
                Fresh Kerala Groceries
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Delivered across Ernakulam
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
