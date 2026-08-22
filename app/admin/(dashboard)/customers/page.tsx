import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { formatPrice } from "@/lib/utils";
import { Users, Phone, MapPin, ShoppingBag, Mail } from "lucide-react";

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
  const customerMap = new Map<
    string,
    {
      name: string;
      phone: string;
      email: string | null;
      city: string;
      address: string;
      orderCount: number;
      totalSpent: number;
      lastOrder: string;
    }
  >();

  orders?.forEach((o: any) => {
    const key = o.phone || o.customer_name;
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        name: o.customer_name,
        phone: o.phone,
        email: o.email || null,
        city: o.city,
        address: o.address,
        orderCount: 1,
        totalSpent: o.total,
        lastOrder: o.created_at,
      });
    } else {
      const existing = customerMap.get(key)!;
      existing.orderCount += 1;
      existing.totalSpent += o.total;
    }
  });

  const customers = Array.from(customerMap.values());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer Directory</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          {customers.length} unique customers who placed orders
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Customer list">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">Customer</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">Contact</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">Location</th>
                <th className="text-center text-xs font-semibold text-gray-500 px-6 py-3.5">Orders</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-6 py-3.5">Total Spent</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-6 py-3.5">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <Users size={28} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium">No customer records found</p>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.phone} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-50 text-gb-green font-bold text-xs flex items-center justify-center border border-emerald-100">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="space-y-0.5">
                        <p className="font-mono text-gray-700 flex items-center gap-1.5">
                          <Phone size={12} className="text-gray-400" /> {c.phone}
                        </p>
                        {c.email && (
                          <p className="text-gray-400 flex items-center gap-1.5">
                            <Mail size={12} /> {c.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      <p className="font-medium text-gray-800">{c.city}</p>
                      <p className="text-gray-400 truncate max-w-xs">{c.address}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-bold text-gb-green bg-green-50 px-2.5 py-1 rounded-full">
                        {c.orderCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      {formatPrice(c.totalSpent)}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-gray-500">
                      {new Date(c.lastOrder).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
