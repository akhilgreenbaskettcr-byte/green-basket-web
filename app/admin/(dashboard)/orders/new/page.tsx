import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  AdminNewOrderClient,
  type CatalogueProduct,
  type DeliveryAreaOption,
  type CustomerContact,
} from "@/components/admin/AdminNewOrderClient";
import { getSiteSettings } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Create Manual Order — Admin / Staff",
  description: "Create WhatsApp and manual telephone orders for customers.",
};

export default async function AdminNewOrderPage() {
  const supabase = await createClient();

  // Verify auth session & role (Admin or Staff)
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

  const role = profile.role as "admin" | "staff";
  const adminClient = createAdminClient();

  // Fetch active products with categories and variants
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: productsData } = await (adminClient as any)
    .from("products")
    .select(`
      id, name, slug, image_url, category_id, base_price, unit_type, is_active,
      categories:category_id (name, gst_enabled, gst_percentage),
      product_variants (
        id, label, price, quantity_value, stock_quantity, is_available, is_auto_priced
      )
    `)
    .eq("is_active", true)
    .order("name", { ascending: true });

  // Format products
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products: CatalogueProduct[] = (productsData || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category_id: p.category_id,
    category_name: p.categories?.name || "General",
    gst_enabled: Boolean(p.categories?.gst_enabled),
    gst_percentage: Number(p.categories?.gst_percentage) || 0,
    image_url: p.image_url,
    base_price: Number(p.base_price) || 0,
    unit_type: p.unit_type || "kg",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    product_variants: (p.product_variants || []).map((v: any) => ({
      id: v.id,
      label: v.label,
      price: Number(v.price) || 0,
      quantity_value: Number(v.quantity_value) || 1,
      stock_quantity: Number(v.stock_quantity) || 0,
      is_available: v.is_available ?? true,
      is_auto_priced: v.is_auto_priced ?? true,
    })),
  }));

  // Fetch categories for filtering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: categoriesData } = await (adminClient as any)
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  // Fetch delivery areas
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: deliveryAreasData } = await (adminClient as any)
    .from("delivery_areas")
    .select("id, area_name, pincode")
    .eq("is_active", true)
    .order("area_name", { ascending: true });

  // Fetch recent orders to construct customer contacts for quick autocomplete
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: recentOrders } = await (adminClient as any)
    .from("orders")
    .select("customer_name, phone, email, address, city, pincode, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  const customerMap = new Map<string, CustomerContact>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentOrders?.forEach((o: any) => {
    const cleanPhone = (o.phone || "").replace(/\D/g, "");
    if (cleanPhone && !customerMap.has(cleanPhone)) {
      customerMap.set(cleanPhone, {
        name: o.customer_name || "",
        phone: cleanPhone,
        email: o.email || null,
        address: o.address || "",
        city: o.city || "Thrissur Town",
        pincode: o.pincode || "680001",
      });
    }
  });

  const pastCustomers = Array.from(customerMap.values());

  // Fetch site settings for delivery fee and UPI ID
  const settings = await getSiteSettings();
  const defaultDeliveryFee =
    settings["delivery_fee"] !== undefined && settings["delivery_fee"] !== ""
      ? Math.max(0, Number(settings["delivery_fee"]))
      : 40;
  const storeUpiId = settings["store_upi_id"] || "greenbasket@okaxis";
  const storeUpiName = settings["store_upi_name"] || "Green Basket TCR";
  const storePhone = settings["contact_phone"] || "+91 90481 78886";

  return (
    <AdminNewOrderClient
      products={products}
      categories={categoriesData || []}
      deliveryAreas={(deliveryAreasData as DeliveryAreaOption[]) || []}
      pastCustomers={pastCustomers}
      defaultDeliveryFee={defaultDeliveryFee}
      userRole={role}
      storeUpiId={storeUpiId}
      storeUpiName={storeUpiName}
      storePhone={storePhone}
    />
  );
}
