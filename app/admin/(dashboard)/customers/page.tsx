import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { AdminCustomersClient, type CustomerRecord } from "@/components/admin/AdminCustomersClient";

export const metadata: Metadata = { title: "Customers — Admin" };

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  // Fetch unique customers from orders table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders } = await (supabase as any)
    .from("orders")
    .select("customer_name, phone, email, city, address, total, created_at")
    .order("created_at", { ascending: false });

  // Aggregate by phone
  const customerMap = new Map<string, CustomerRecord>();

  orders?.forEach((o: any) => {
    const key = o.phone || o.customer_name;
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        name: o.customer_name || "Customer",
        phone: o.phone || "",
        email: o.email || null,
        city: o.city || "Thrissur",
        address: o.address || "",
        orderCount: 1,
        totalSpent: Number(o.total) || 0,
        lastOrder: o.created_at,
      });
    } else {
      const existing = customerMap.get(key)!;
      existing.orderCount += 1;
      existing.totalSpent += Number(o.total) || 0;
    }
  });

  const customers = Array.from(customerMap.values());

  return <AdminCustomersClient customers={customers} />;
}
