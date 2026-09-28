import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  AdminOrdersClient,
  type AdminOrderWithItems,
} from "@/components/admin/AdminOrdersClient";
import { getSiteSettings } from "@/lib/supabase/queries";

export const metadata: Metadata = { title: "Orders — Admin" };

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  // Verify auth session & role
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "staff") {
    redirect("/admin/login");
  }

  // Fetch orders and settings in parallel
  const adminClient = createAdminClient();

  const [ordersRes, settings] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (adminClient as any)
      .from("orders")
      .select(`
        id, order_number, customer_name, phone, email, address, city, pincode, notes,
        status, subtotal, delivery_fee, total, created_at, gps_lat, gps_lng,
        order_items(id, product_name_snapshot, variant_label_snapshot, unit_price, quantity, line_total)
      `)
      .order("created_at", { ascending: false }) as Promise<{ data: AdminOrderWithItems[] | null }>,
    getSiteSettings(),
  ]);

  const orders = ordersRes.data;
  const storeUpiId = settings["store_upi_id"] || "greenbasket@okaxis";
  const storeUpiName = settings["store_upi_name"] || "Green Basket TCR";
  const storePhone = settings["contact_phone"] || "+91 90481 78886";

  return (
    <AdminOrdersClient
      orders={orders || []}
      storeUpiId={storeUpiId}
      storeUpiName={storeUpiName}
      storePhone={storePhone}
    />
  );
}

