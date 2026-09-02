"use client";

import { useState } from "react";
import { formatPrice, formatOrderStatus } from "@/lib/utils";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";
import {
  Search,
  ShoppingBag,
  Phone,
  MapPin,
  Calendar,
  MessageCircle,
  X,
  User,
  Clock,
  Mail,
} from "lucide-react";
import type { Order, OrderStatus } from "@/types/database";

export type AdminOrderWithItems = Order & {
  order_items?: {
    id: string;
    product_name_snapshot: string;
    variant_label_snapshot: string;
    unit_price: number;
    quantity: number;
    line_total: number;
  }[];
};

interface AdminOrdersClientProps {
  orders: AdminOrderWithItems[];
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function AdminOrdersClient({ orders }: AdminOrdersClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderWithItems | null>(null);

  const filtered = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      order.phone.toLowerCase().includes(search.toLowerCase()) ||
      order.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {orders.length} orders placed in total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number, customer name, phone, city..."
            className="gb-input has-icon !pl-10 text-xs py-2 bg-gray-50/50"
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="gb-input text-xs py-2 sm:w-56 bg-gray-50/50"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile Card List View (< md) */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">
            <ShoppingBag size={28} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">No orders found</p>
          </div>
        ) : (
          filtered.map((order) => {
            const { label, color } = formatOrderStatus(order.status);
            const cleanPhone = order.phone.replace(/\D/g, "");

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3"
              >
                {/* Top Row: Order Number, Status & Date */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <div>
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="text-sm font-extrabold text-gb-charcoal hover:text-gb-green transition-colors text-left"
                    >
                      {order.order_number}
                    </button>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className={`gb-badge text-[10px] font-bold ${color}`}>
                    {label}
                  </span>
                </div>

                {/* Customer Row */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div>
                    <p className="font-bold text-gray-900">{order.customer_name}</p>
                    <p className="text-gray-500 text-[11px] mt-0.5">{order.city} • <span className="font-mono">{order.pincode}</span></p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`tel:+91${cleanPhone}`}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
                      title="Call Customer"
                    >
                      <Phone size={13} />
                    </a>
                    <a
                      href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(order.customer_name)},%20regarding%20your%20Green%20Basket%20Order%20${order.order_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors"
                      title="Chat on WhatsApp"
                    >
                      <MessageCircle size={14} />
                    </a>
                  </div>
                </div>

                {/* Bottom Row: Total, Status Selector & Inspect Button */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total</span>
                    <p className="text-sm font-black text-gb-green font-mono">
                      {formatPrice(order.total)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <OrderStatusUpdater
                      orderId={order.id}
                      currentStatus={order.status as OrderStatus}
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="text-xs font-bold text-gb-green bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Orders list">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">Order</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">Customer</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">City</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">Status</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-6 py-3.5">Total</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">Update Status</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-6 py-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    <ShoppingBag size={28} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium">No orders found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const { label, color } = formatOrderStatus(order.status);
                  const cleanPhone = order.phone.replace(/\D/g, "");

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Order number */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-sm font-bold text-gb-charcoal hover:text-gb-green transition-colors text-left"
                        >
                          {order.order_number}
                        </button>
                      </td>

                      {/* Customer info */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-tight">
                            {order.customer_name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400 font-mono">
                              {order.phone}
                            </span>
                            <a
                              href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(order.customer_name)},%20regarding%20your%20Green%20Basket%20Order%20${order.order_number}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 p-0.5"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle size={13} />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* City */}
                      <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                        {order.city}
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4">
                        <span className={`gb-badge text-[11px] ${color}`}>
                          {label}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                        {formatPrice(order.total)}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Status dropdown */}
                      <td className="px-6 py-4">
                        <OrderStatusUpdater
                          orderId={order.id}
                          currentStatus={order.status as OrderStatus}
                        />
                      </td>

                      {/* View details button */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-xs font-semibold text-gb-green bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal / Drawer */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs text-gray-400 font-mono">Order Details</span>
                <h3 className="text-xl font-bold text-gb-charcoal">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500"
              >
                <X size={16} />
              </button>
            </div>

            {/* Customer information card */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 space-y-3.5 text-sm border border-gray-100">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-gray-900 font-bold">
                  <User size={16} className="text-gb-green" />
                  <span>{selectedOrder.customer_name}</span>
                </div>
                <span className="text-xs text-gray-400 font-mono">Customer</span>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-gb-green" />
                  <span className="font-mono font-bold">{selectedOrder.phone}</span>
                  {selectedOrder.email && (
                    <span className="text-gray-400 truncate max-w-[160px]">({selectedOrder.email})</span>
                  )}
                </div>
              </div>

              {/* Quick Contact Action Buttons */}
              <div className="pt-2 border-t border-gray-200/60 flex items-center gap-2 flex-wrap">
                <a
                  href={`tel:+91${selectedOrder.phone.replace(/\D/g, "")}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 font-bold text-xs py-2 px-3 rounded-xl transition-colors shadow-2xs"
                >
                  <Phone size={14} className="text-gb-green" />
                  <span>Call Mobile</span>
                </a>

                <a
                  href={`https://wa.me/91${selectedOrder.phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(selectedOrder.customer_name)},%20this%20is%20regarding%20your%20Green%20Basket%20Order%20${selectedOrder.order_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-colors shadow-2xs"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp</span>
                </a>

                {selectedOrder.email && (
                  <a
                    href={`mailto:${selectedOrder.email}?subject=Regarding%20Green%20Basket%20Order%20${selectedOrder.order_number}`}
                    className="inline-flex items-center justify-center p-2 rounded-xl bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 transition-colors"
                    title="Send Email"
                  >
                    <Mail size={15} />
                  </a>
                )}
              </div>

              <div className="flex items-start gap-2 text-xs text-gray-600 pt-1">
                <MapPin size={15} className="text-gb-green shrink-0 mt-0.5" />
                <div>
                  <p className="leading-relaxed">{selectedOrder.address}</p>
                  <p className="font-bold text-gray-800 mt-0.5">
                    {selectedOrder.city} — <span className="font-mono">{selectedOrder.pincode}</span>
                  </p>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-900 border border-amber-100">
                  <span className="font-semibold">Delivery Note:</span> {selectedOrder.notes}
                </div>
              )}
            </div>

            {/* Order Items List */}
            {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Ordered Products ({selectedOrder.order_items.length})
                </h4>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                  {selectedOrder.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 flex items-center justify-between text-sm bg-white"
                    >
                      <div>
                        <p className="font-bold text-gray-900">
                          {item.product_name_snapshot}
                        </p>
                        <p className="text-xs text-gray-500">
                          Size: {item.variant_label_snapshot} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-gray-900">
                        {formatPrice(item.line_total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Fee</span>
                <span>
                  {selectedOrder.delivery_fee === 0 ? (
                    <span className="text-green-600 font-semibold">Free</span>
                  ) : (
                    formatPrice(selectedOrder.delivery_fee)
                  )}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base text-gb-charcoal border-t border-gray-100 pt-2">
                <span>Total Amount (Cash on Delivery)</span>
                <span className="text-gb-green">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="btn-ghost w-full justify-center"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
