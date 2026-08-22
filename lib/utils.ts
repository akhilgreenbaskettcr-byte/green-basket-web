import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Install clsx + tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return `₹${price.toFixed(0)}`;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "…";
}

export function absoluteUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${path}`;
}

export function formatOrderStatus(
  status: string
): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending", color: "text-amber-600 bg-amber-50" },
    confirmed: { label: "Confirmed", color: "text-blue-600 bg-blue-50" },
    preparing: { label: "Preparing", color: "text-purple-600 bg-purple-50" },
    out_for_delivery: {
      label: "Out for Delivery",
      color: "text-orange-600 bg-orange-50",
    },
    delivered: { label: "Delivered", color: "text-green-700 bg-green-50" },
    cancelled: { label: "Cancelled", color: "text-red-600 bg-red-50" },
  };
  return map[status] ?? { label: status, color: "text-gray-600 bg-gray-50" };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
