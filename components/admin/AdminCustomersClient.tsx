"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import {
  Users,
  Phone,
  MapPin,
  Mail,
  MessageCircle,
  Search,
  ShoppingBag,
  Calendar,
} from "lucide-react";

export interface CustomerRecord {
  name: string;
  phone: string;
  email: string | null;
  city: string;
  address: string;
  orderCount: number;
  totalSpent: number;
  lastOrder: string;
}

interface AdminCustomersClientProps {
  customers: CustomerRecord[];
}

export function AdminCustomersClient({ customers }: AdminCustomersClientProps) {
  const [search, setSearch] = useState("");

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.city.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Directory</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {customers.length} unique customers who placed orders
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, city..."
            className="gb-input has-icon !pl-10 text-xs py-2.5 bg-white shadow-2xs w-full"
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
      </div>

      {/* ── Mobile Customers Card View (< md) ── */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">
            <Users size={28} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">No customers match your search</p>
          </div>
        ) : (
          filtered.map((c) => {
            const cleanPhone = c.phone.replace(/\D/g, "");

            return (
              <div
                key={c.phone || c.name}
                className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3"
              >
                {/* Header: Name + Initial + Order Count */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-gb-green font-bold text-xs flex items-center justify-center border border-emerald-100">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-tight">{c.name}</p>
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">{c.phone}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gb-green bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                    {c.orderCount} {c.orderCount === 1 ? "order" : "orders"}
                  </span>
                </div>

                {/* Location & Spend Info */}
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Location</span>
                    <p className="text-gray-700 font-medium">{c.city || "Thrissur"}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Spent</span>
                    <p className="text-sm font-black text-gb-green font-mono">{formatPrice(c.totalSpent)}</p>
                  </div>
                </div>

                {/* 1-Tap Quick Contact Action Bar */}
                <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                  <a
                    href={`tel:+91${cleanPhone}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 font-bold text-xs py-2 px-3 rounded-xl transition-colors shadow-2xs"
                  >
                    <Phone size={13} className="text-gb-green" />
                    <span>Call</span>
                  </a>

                  <a
                    href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(c.name)},%20greetings%20from%20Green%20Basket%20TCR!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition-colors shadow-2xs"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp</span>
                  </a>

                  {c.email && (
                    <a
                      href={`mailto:${c.email}?subject=Greetings%20from%20Green%20Basket%20TCR`}
                      className="inline-flex items-center justify-center p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition-colors"
                      title="Email Customer"
                    >
                      <Mail size={14} />
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Desktop Customers Table View (>= md) ── */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Customer list">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">Customer</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">Contact Details</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">Contact Customer</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3.5">Location</th>
                <th className="text-center text-xs font-semibold text-gray-500 px-6 py-3.5">Orders</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-6 py-3.5">Total Spent</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-6 py-3.5">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <Users size={28} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium">No customers found matching search</p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const cleanPhone = c.phone.replace(/\D/g, "");

                  return (
                    <tr key={c.phone || c.name} className="hover:bg-gray-50/50 transition-colors">
                      {/* Customer Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-50 text-gb-green font-bold text-xs flex items-center justify-center border border-emerald-100">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-gray-900">{c.name}</span>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-mono font-medium text-gray-700">{c.phone}</p>
                          {c.email && (
                            <p className="text-gray-400 text-[11px] truncate max-w-[150px]">{c.email}</p>
                          )}
                        </div>
                      </td>

                      {/* 1-Tap Call & WhatsApp Buttons */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:+91${cleanPhone}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
                            title="Call Customer"
                          >
                            <Phone size={12} className="text-gb-green" />
                            <span>Call</span>
                          </a>

                          <a
                            href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(c.name)},%20greetings%20from%20Green%20Basket%20TCR!`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors"
                            title="WhatsApp Customer"
                          >
                            <MessageCircle size={13} />
                            <span>WhatsApp</span>
                          </a>

                          {c.email && (
                            <a
                              href={`mailto:${c.email}?subject=Greetings%20from%20Green%20Basket%20TCR`}
                              className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
                              title="Email Customer"
                            >
                              <Mail size={13} />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 text-xs text-gray-600">
                        <p className="font-medium text-gray-800">{c.city || "Thrissur"}</p>
                        <p className="text-gray-400 truncate max-w-xs">{c.address}</p>
                      </td>

                      {/* Order count */}
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-bold text-gb-green bg-green-50 px-2.5 py-1 rounded-full">
                          {c.orderCount}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="px-6 py-4 text-right text-sm font-bold text-gray-900 font-mono">
                        {formatPrice(c.totalSpent)}
                      </td>

                      {/* Last Order Date */}
                      <td className="px-6 py-4 text-right text-xs text-gray-500">
                        {new Date(c.lastOrder).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
