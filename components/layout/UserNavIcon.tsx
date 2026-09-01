"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogIn, ShoppingBag, MapPin, LogOut, ChevronDown } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function UserNavIcon() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u || null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
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
    setDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse shrink-0" />;
  }

  // Logged-in Profile Avatar with Dropdown
  if (user) {
    const displayName =
      user.user_metadata?.full_name || user.email?.split("@")[0] || "Profile";

    return (
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 hover:bg-green-100 text-gb-green font-bold text-xs transition-colors border border-green-200 cursor-pointer"
          aria-expanded={dropdownOpen}
          aria-label="User account menu"
        >
          <div className="w-5 h-5 rounded-full bg-gb-green text-white flex items-center justify-center font-bold text-[10px] uppercase">
            {displayName.charAt(0)}
          </div>
          <span className="max-w-[90px] truncate">{displayName}</span>
          <ChevronDown size={13} className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gb-border py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3.5 py-2 border-b border-gray-100">
              <p className="text-[11px] text-gray-400 font-medium">Signed in as</p>
              <p className="text-xs font-bold text-gb-charcoal truncate">{user.email}</p>
            </div>

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
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 font-semibold transition-colors text-left"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    );
  }

  // Guest Login Button — icon + text style on desktop, icon only on mobile
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
