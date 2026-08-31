"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

const CheckoutSchema = z.object({
  customer_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().min(10, "Please enter a complete address").max(500),
  city: z.string().min(2, "City is required").max(100),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  notes: z.string().max(500).optional(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      variantId: z.string().uuid(),
      productName: z.string(),
      variantLabel: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "Cart is empty"),
  subtotal: z.number().nonnegative(),
  deliveryFee: z.number().nonnegative(),
  total: z.number().positive(),
});

export type CheckoutFormData = z.infer<typeof CheckoutSchema>;

export type CreateOrderResult =
  | { success: true; orderNumber: string }
  | { success: false; error: string };

export async function createOrder(
  formData: CheckoutFormData
): Promise<CreateOrderResult> {
  // Validate request schema
  const parsed = CheckoutSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid order data",
    };
  }

  const data = parsed.data;
  const supabase = await createClient();

  // Critical Server-side Security Check: Verify that requested delivery PIN code is active
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: activeArea, error: areaError } = await (supabase as any)
    .from("delivery_areas")
    .select("id, is_active")
    .eq("pincode", data.pincode)
    .eq("is_active", true)
    .maybeSingle();

  if (areaError || !activeArea) {
    return {
      success: false,
      error: `Delivery is currently unavailable in PIN code ${data.pincode}. Please select an active delivery area.`,
    };
  }

  // Get logged-in user (optional — supports guest checkout)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Generate order number using DB function
  const { data: orderNumberData, error: orderNumberError } = await supabase
    .rpc("generate_order_number");

  if (orderNumberError || !orderNumberData) {
    console.error("Order number error:", orderNumberError);
    return {
      success: false,
      error: "Failed to generate order number. Please try again.",
    };
  }

  const orderNumber = orderNumberData as string;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: user?.id ?? null,
      status: "pending",
      subtotal: data.subtotal,
      delivery_fee: data.deliveryFee,
      total: data.total,
      customer_name: data.customer_name,
      phone: data.phone,
      email: data.email || null,
      address: data.address,
      city: data.city,
      pincode: data.pincode,
      notes: data.notes || null,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Order creation error:", orderError);
    return {
      success: false,
      error: "Failed to create order. Please try again.",
    };
  }

  // Create order items
  const orderItems = data.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    variant_id: item.variantId,
    product_name_snapshot: item.productName,
    variant_label_snapshot: item.variantLabel,
    unit_price: item.price,
    quantity: item.quantity,
    line_total: item.price * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("Order items error:", itemsError);
  }

  return { success: true, orderNumber };
}
