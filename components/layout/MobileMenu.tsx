"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronRight, LogIn, User, LogOut, LayoutDashboard, Shield } from "lucide-react";
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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const checkUserRole = async (currentUser: any) => {
      if (!currentUser) {
        setUser(null);
        setIsAdmin(false);
        return;
      }
      setUser(currentUser);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .maybeSingle();

        setIsAdmin(profile?.role === "admin" || currentUser.email === "admin@greenbasket.in");
      } catch {
        setIsAdmin(currentUser.email === "admin@greenbasket.in");
      }
    };

    supabase.auth.getUser().then(({ data: { user: u } }) => checkUserRole(u));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      checkUserRole(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
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
      >
        <Menu size={22} className="text-gb-charcoal" />
      </button>

      {/* Backdrop & Drawer */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
        >
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div className="relative z-10 w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            {/* Top header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <Logo href="/" size="sm" />
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gb-charcoal transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="p-4 flex-1">
              <ul className="space-y-1">
                {NAV_LINKS.map(({ href, label }) => {
                  const isActive = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-colors",
                          isActive
                            ? "bg-green-50 text-gb-green"
                            : "text-gb-charcoal hover:bg-gray-50"
                        )}
                      >
                        <span>{label}</span>
                        <ChevronRight
                          size={16}
                          className={cn(
                            "transition-transform",
                            isActive ? "text-gb-green" : "text-gray-400"
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}

                {/* Auth section */}
                <li className="pt-2">
                  <div className="border-t border-gray-100 mb-2" />
                  {user ? (
                    <>
                      {/* Logged-in info */}
                      <div className="px-3 py-2 mb-1">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                              isAdmin ? "bg-emerald-700" : "bg-gb-green"
                            }`}
                          >
                            {isAdmin ? <Shield size={13} /> : (user.user_metadata?.full_name || user.email || "U").charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-gb-charcoal truncate">
                                {isAdmin ? "Admin User" : user.user_metadata?.full_name || user.email}
                              </p>
                              {isAdmin && (
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Admin Dashboard shortcut */}
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white mb-2 shadow-xs"
                        >
                          <LayoutDashboard size={16} />
                          <span>Admin Dashboard →</span>
                        </Link>
                      )}

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
                Delivered across Thrissur, Kerala
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
