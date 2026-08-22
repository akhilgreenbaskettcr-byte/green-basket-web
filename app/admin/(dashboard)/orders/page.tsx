import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import {
  AdminOrdersClient,
  type AdminOrderWithItems,
} from "@/components/admin/AdminOrdersClient";

export const metadata: Metadata = { title: "Orders — Admin" };

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders } = await (supabase as any)
    .from("orders")
    .select(`
      id, order_number, customer_name, phone, email, address, city, pincode, notes,
      status, subtotal, delivery_fee, total, created_at,
      order_items(id, product_name_snapshot, variant_label_snapshot, unit_price, quantity, line_total)
    `)
    .order("created_at", { ascending: false }) as { data: AdminOrderWithItems[] | null };

  return <AdminOrdersClient orders={orders || []} />;
}
