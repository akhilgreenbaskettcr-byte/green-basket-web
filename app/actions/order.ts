"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import crypto from "crypto";
import { sendOrderEmails } from "@/lib/email";

const isUUID = (str: string | undefined | null): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};

const CheckoutSchema = z.object({
  customer_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().min(10, "Please enter a complete address").max(500),
  city: z.string().min(2, "City is required").max(100),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  notes: z.string().max(500).optional().or(z.literal("")),
  payment_method: z.enum(["razorpay", "cod"]).default("cod"),
  razorpay_payment_id: z.string().optional().or(z.literal("")),
  razorpay_order_id: z.string().optional().or(z.literal("")),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string(),
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
    console.error("Zod Validation Error:", parsed.error.format());
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid order data",
    };
  }

  const data = parsed.data;
  const supabase = await createClient();

  // Get logged-in user (optional — supports guest checkout)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Generate clean, instant unique order number
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
  const orderNumber = `GB-${dateStr}-${randomHex}`;

  // Prepare notes with payment metadata
  let formattedNotes = data.notes?.trim() || "";
  if (data.payment_method === "razorpay" && data.razorpay_payment_id) {
    formattedNotes = `[PAID ONLINE via Razorpay | Ref: ${data.razorpay_payment_id}] ${formattedNotes}`.trim();
  } else {
    formattedNotes = `[PAYMENT: Cash on Delivery] ${formattedNotes}`.trim();
  }

  const orderStatus = data.payment_method === "razorpay" ? "confirmed" : "pending";
  const orderId = crypto.randomUUID();

  // Create order in DB using explicit UUID
  const { error: orderError } = await supabase
    .from("orders")
    .insert({
      id: orderId,
      order_number: orderNumber,
      customer_id: user?.id ?? null,
      status: orderStatus,
      subtotal: data.subtotal,
      delivery_fee: data.deliveryFee,
      total: data.total,
      customer_name: data.customer_name,
      phone: data.phone,
      email: data.email || null,
      address: data.address,
      city: data.city,
      pincode: data.pincode,
      notes: formattedNotes || null,
    });

  if (orderError) {
    console.error("Order creation error:", orderError);
    return {
      success: false,
      error: orderError?.message || "Failed to create order. Please try again.",
    };
  }

  // Create order items with safe UUID parsing
  const orderItems = data.items.map((item) => ({
    id: crypto.randomUUID(),
    order_id: orderId,
    product_id: isUUID(item.productId) ? item.productId : null,
    variant_id: isUUID(item.variantId) ? item.variantId : null,
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

  // Trigger Brevo SMTP email notifications asynchronously (non-blocking)
  sendOrderEmails({
    orderNumber,
    customerName: data.customer_name,
    phone: data.phone,
    email: data.email,
    address: data.address,
    city: data.city,
    pincode: data.pincode,
    notes: data.notes,
    paymentMethod: data.payment_method,
    items: data.items,
    subtotal: data.subtotal,
    deliveryFee: data.deliveryFee,
    total: data.total,
  }).catch((err) => console.error("Email notification failed:", err));

  return { success: true, orderNumber };
}
