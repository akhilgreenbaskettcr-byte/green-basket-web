import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { listStaffAccounts } from "@/app/actions/staff";
import { StaffManagementClient } from "@/components/admin/StaffManagementClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Staff Management — Admin" };

export default async function StaffManagementPage() {
  const supabase = await createClient();

  // Admin-only page
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/admin/orders");

  const staffList = await listStaffAccounts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Create and manage staff accounts. Staff can access orders, products, categories, and delivery areas.
        </p>
      </div>
      <StaffManagementClient initialStaff={staffList} />
    </div>
  );
}
