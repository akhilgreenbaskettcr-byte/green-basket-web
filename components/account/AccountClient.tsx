"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { formatPrice, formatOrderStatus } from "@/lib/utils";
import { Search, Package, Clock, Loader2 } from "lucide-react";
import type { Order } from "@/types/database";

type TrackedOrder = Pick<
  Order,
  "id" | "order_number" | "status" | "total" | "created_at" | "customer_name" | "city" | "delivery_fee"
>;

export function AccountClient() {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [searched, setSearched] = useState(false);
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setError("");
    setSearched(true);

    startTransition(async () => {
      const supabase = createClient();
      const trimmed = query.trim();

      // Search by order_number or phone
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: dbError } = await (supabase as any)
        .from("orders")
        .select("id, order_number, status, total, created_at, customer_name, city, delivery_fee")
        .or(`order_number.ilike.%${trimmed}%,phone.eq.${trimmed}`)
        .order("created_at", { ascending: false });

      if (dbError) {
        setError("Could not find any order with that details. Please verify your order number or phone.");
        setOrders([]);
      } else {
        setOrders((data as TrackedOrder[]) || []);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Order lookup card */}
      <div className="bg-white rounded-2xl border border-gb-border p-6 md:p-8">
        <h2 className="text-xl font-bold text-gb-charcoal mb-2 flex items-center gap-2">
          <Package size={20} style={{ color: "#245B35" }} />
          Track Your Order
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Enter your Order Number (e.g. <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">GB-20260822-0001</code>) or your 10-digit registered phone number.
        </p>

        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Order number or phone number"
              className="gb-input pl-10"
              required
            />
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary shrink-0 justify-center"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                Searching…
              </>
            ) : (
              "Track Order"
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-700 text-sm" role="alert">
            {error}
          </div>
        )}
      </div>

      {/* Search results */}
      {searched && !isPending && (
        <div className="space-y-4">
          {orders.length === 0 && !error ? (
            <div className="bg-white rounded-2xl border border-gb-border p-8 text-center">
              <Clock size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="font-semibold text-gb-charcoal">No orders found</p>
              <p className="text-gray-400 text-sm mt-1">
                We couldn&apos;t find any order matching &ldquo;{query}&rdquo;.
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const { label, color } = formatOrderStatus(order.status);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gb-border p-6 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4">
                    <div>
                      <span className="text-xs text-gray-400 font-mono">Order Number</span>
                      <p className="text-base font-bold text-gb-charcoal">
                        {order.order_number}
                      </p>
                    </div>
                    <span className={`gb-badge ${color} text-xs font-semibold px-3 py-1`}>
                      {label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Customer</p>
                      <p className="font-medium text-gray-700">{order.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">City</p>
                      <p className="font-medium text-gray-700">{order.city}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Date</p>
                      <p className="font-medium text-gray-700">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Order Total</span>
                    <span className="text-lg font-bold text-gb-charcoal">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
