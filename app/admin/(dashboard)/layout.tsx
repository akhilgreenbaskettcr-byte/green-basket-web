import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Logo } from "@/components/ui/Logo";
import type { Profile } from "@/types/database";

export const metadata: Metadata = {
  title: { default: "Admin — Green Basket", template: "%s | Admin — Green Basket" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // Secure server-side auth check using getUser()
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Verify admin role from profiles table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single() as { data: Pick<Profile, "role"> | null };

  if (profile?.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="lg:hidden">
            <Logo href="/admin" size="sm" />
          </div>
          <div className="hidden lg:block">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono">
              Store Management Portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm text-gray-500 font-medium">{user.email}</span>
            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
