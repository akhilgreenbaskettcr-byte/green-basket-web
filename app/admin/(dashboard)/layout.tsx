import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
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
        <AdminHeader userEmail={user.email} />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 sm:pb-24 lg:pb-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
