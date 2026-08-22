import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { formatPrice, formatOrderStatus } from "@/lib/utils";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowRight,
  Plus,
  Settings,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import type { Order } from "@/types/database";

export const metadata: Metadata = { title: "Dashboard — Admin" };

type DashboardOrder = Pick<
  Order,
  "id" | "order_number" | "status" | "total" | "customer_name" | "created_at"
>;
type LowStockVariant = {
  id: string;
  product_id: string;
  label: string;
  stock_quantity: number;
  products: { name: string; slug: string } | null;
};

async function getDashboardStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  const [
    { count: totalProducts },
    { count: totalOrders },
    { data: todayOrders },
    { data: recentOrders },
    { data: lowStockVariants },
  ] = await Promise.all([
    sb.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    sb.from("orders").select("*", { count: "exact", head: true }),
    sb.from("orders").select("total").gte("created_at", todayISO),
    sb.from("orders")
      .select("id, order_number, status, total, customer_name, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    sb.from("product_variants")
      .select("id, product_id, label, stock_quantity, products(name, slug)")
      .lt("stock_quantity", 15)
      .eq("is_available", true)
      .limit(5),
  ]);

  const todayRevenue =
    (todayOrders as { total: number }[] | null)?.reduce((sum, o) => sum + o.total, 0) ?? 0;

  return {
    totalProducts: totalProducts ?? 0,
    totalOrders: totalOrders ?? 0,
    todayRevenue,
    todayOrderCount: (todayOrders as unknown[])?.length ?? 0,
    recentOrders: (recentOrders as DashboardOrder[]) ?? [],
    lowStockVariants: (lowStockVariants as LowStockVariant[]) ?? [],
  };
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const stats = await getDashboardStats(supabase);

  const STAT_CARDS = [
    {
      label: "Today's Revenue",
      value: formatPrice(stats.todayRevenue),
      sub: `${stats.todayOrderCount} orders today`,
      icon: TrendingUp,
      accent: "text-emerald-700 bg-emerald-50 border-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      sub: "Lifetime purchases",
      icon: ShoppingBag,
      accent: "text-blue-700 bg-blue-50 border-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Active Catalogue",
      value: stats.totalProducts.toLocaleString(),
      sub: "Products live in store",
      icon: Package,
      accent: "text-purple-700 bg-purple-50 border-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Low Stock Items",
      value: stats.lowStockVariants.length.toString(),
      sub: "Needs restocking soon",
      icon: AlertTriangle,
      accent: "text-amber-700 bg-amber-50 border-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time analytics and inventory status for Green Basket
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3.5 py-2 rounded-xl transition-colors shadow-xs"
          >
            Storefront <ExternalLink size={13} />
          </Link>
          <Link
            href="/admin/products/new"
            className="btn-primary text-xs flex items-center gap-1.5 px-4 py-2 shadow-xs"
          >
            <Plus size={15} /> Add Product
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {STAT_CARDS.map(({ label, value, sub, icon: Icon, accent, iconColor }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500">{label}</span>
              <div className={`p-2 rounded-xl border ${accent}`}>
                <Icon size={16} className={iconColor} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gb-charcoal tracking-tight">{value}</p>
              <p className="text-xs text-gray-400 mt-1">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Orders & Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-gb-green" />
              <h2 className="font-bold text-sm text-gray-900">Recent Customer Orders</h2>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-gb-green hover:underline flex items-center gap-1"
            >
              View all orders <ArrowRight size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full" aria-label="Recent orders">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Order</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-6 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-400 text-xs">
                      No orders placed yet
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order) => {
                    const { label, color } = formatOrderStatus(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3.5">
                          <Link
                            href="/admin/orders"
                            className="text-xs font-bold text-gb-charcoal hover:text-gb-green transition-colors font-mono"
                          >
                            {order.order_number}
                          </Link>
                        </td>
                        <td className="px-6 py-3.5 text-xs text-gray-700 font-medium">
                          {order.customer_name}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`gb-badge text-[10px] ${color}`}>{label}</span>
                        </td>
                        <td className="px-6 py-3.5 text-right text-xs font-bold text-gray-900">
                          {formatPrice(order.total)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts & Quick Tools */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={17} className="text-amber-600" />
                <h3 className="font-bold text-sm text-gray-900">Low Stock Warnings</h3>
              </div>
              <Link
                href="/admin/products"
                className="text-[11px] font-semibold text-gb-green hover:underline"
              >
                Catalogue
              </Link>
            </div>

            <div className="space-y-2.5">
              {stats.lowStockVariants.length === 0 ? (
                <div className="text-center py-6 text-gray-400 flex flex-col items-center gap-1.5">
                  <CheckCircle size={24} className="text-emerald-500" />
                  <p className="text-xs font-medium text-gray-600">All inventory well stocked!</p>
                </div>
              ) : (
                stats.lowStockVariants.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-100"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {v.products?.name ?? "Product"}
                      </p>
                      <p className="text-[11px] text-gray-500">{v.label}</p>
                    </div>
                    <Link
                      href={`/admin/products/${v.product_id}`}
                      className="text-[11px] font-bold text-amber-800 bg-amber-100/80 hover:bg-amber-200 px-2.5 py-1 rounded-lg shrink-0 transition-colors"
                    >
                      {v.stock_quantity} left →
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider">
              Quick Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin/settings"
                className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors"
              >
                <Settings size={15} className="text-gb-green" />
                Hero Banner
              </Link>
              <Link
                href="/admin/categories"
                className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors"
              >
                <Package size={15} className="text-gb-green" />
                Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
