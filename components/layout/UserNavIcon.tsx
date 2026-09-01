"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogIn, ShoppingBag, MapPin, LogOut, ChevronDown, Shield, LayoutDashboard } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function UserNavIcon() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    const checkUserRole = async (currentUser: any) => {
      if (!currentUser) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
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

        if (profile?.role === "admin" || currentUser.email === "admin@greenbasket.in") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(currentUser.email === "admin@greenbasket.in");
      } finally {
        setLoading(false);
      }
    };

    supabase.auth.getUser().then(({ data: { user: u } }) => {
      checkUserRole(u);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUserRole(session?.user || null);
    });

    // Close dropdown on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse shrink-0" />;
  }

  // Logged-in Profile Avatar with Dropdown
  if (user) {
    const displayName = isAdmin
      ? "Admin"
      : user.user_metadata?.full_name || user.email?.split("@")[0] || "Profile";

    return (
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs transition-all border cursor-pointer ${
            isAdmin
              ? "bg-emerald-50 hover:bg-emerald-100 text-gb-green border-emerald-300 shadow-2xs"
              : "bg-green-50 hover:bg-green-100 text-gb-green border-green-200"
          }`}
          aria-expanded={dropdownOpen}
          aria-label="User account menu"
        >
          <div
            className={`w-5 h-5 rounded-full text-white flex items-center justify-center font-bold text-[10px] uppercase ${
              isAdmin ? "bg-emerald-700" : "bg-gb-green"
            }`}
          >
            {isAdmin ? <Shield size={11} /> : displayName.charAt(0)}
          </div>
          <span className="max-w-[90px] truncate">{displayName}</span>
          <ChevronDown size={13} className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gb-border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3.5 py-2 border-b border-gray-100 mb-1">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Signed in as</p>
                {isAdmin && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-gb-charcoal truncate">{user.email}</p>
            </div>

            {/* Quick Admin Dashboard Link if Admin */}
            {isAdmin && (
              <div className="px-2 pb-1.5 mb-1 border-b border-gray-100">
                <Link
                  href="/admin"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all rounded-xl shadow-xs"
                >
                  <LayoutDashboard size={14} />
                  <span>Admin Dashboard →</span>
                </Link>
              </div>
            )}

            <Link
              href="/account"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:bg-green-50 hover:text-gb-green font-medium transition-colors"
            >
              <User size={14} />
              My Profile
            </Link>

            <Link
              href="/account"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:bg-green-50 hover:text-gb-green font-medium transition-colors"
            >
              <ShoppingBag size={14} />
              My Orders
            </Link>

            <Link
              href="/account"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:bg-green-50 hover:text-gb-green font-medium transition-colors"
            >
              <MapPin size={14} />
              Saved Addresses
            </Link>

            <div className="border-t border-gray-100 my-1" />

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold transition-colors text-left cursor-pointer"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    );
  }

  // Guest Login Button
  return (
    <Link
      href="/login"
      className="flex items-center justify-center p-2 md:px-3 md:py-1.5 rounded-full text-gb-green font-semibold text-sm transition-colors hover:bg-green-50 shrink-0 border border-transparent hover:border-green-200"
      aria-label="Login"
    >
      <User size={18} strokeWidth={1.8} />
      <span className="hidden md:inline">Login</span>
    </Link>
  );
}
