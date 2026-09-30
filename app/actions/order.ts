"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import crypto from "crypto";
import { sendOrderEmails, sendDeliveryConfirmationEmail } from "@/lib/email";
import type { OrderStatus } from "@/types/database";

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
  gps_lat: z.number().optional().nullable(),
  gps_lng: z.number().optional().nullable(),
  location_link: z.string().optional().nullable(),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string(),
      productName: z.string(),
      variantLabel: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
      imageUrl: z.string().optional().nullable(),
      gstPercentage: z.number().optional().nullable(),
      gstAmount: z.number().optional().nullable(),
    })
  ).min(1, "Cart is empty"),
  subtotal: z.number().nonnegative(),
  gstTotal: z.number().nonnegative().optional().default(0),
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

  // Verify inventory stock for all ordered items
  const variantIds = data.items.map((i) => i.variantId).filter(isUUID);
  if (variantIds.length > 0) {
    const { data: dbVariants, error: varError } = await supabase
      .from("product_variants")
      .select("id, label, stock_quantity, is_available, products(name)")
      .in("id", variantIds);

    if (!varError && dbVariants) {
      for (const item of data.items) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbVar = dbVariants.find((v: any) => v.id === item.variantId);
        if (dbVar) {
          if (!dbVar.is_available || (dbVar.stock_quantity ?? 0) <= 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pName = (dbVar as any).products?.name || item.productName;
            return {
              success: false,
              error: `"${pName} (${dbVar.label})" is currently out of stock. Please remove it from your basket to proceed.`,
            };
          }
        }
      }
    }
  }

  // Generate date-based order number in proper sequence: GB-YYMMDD-0001
  const now = new Date();
  const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const yy = String(istTime.getUTCFullYear()).slice(2);
  const mm = String(istTime.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(istTime.getUTCDate()).padStart(2, "0");
  const dateStr = `${yy}${mm}${dd}`;
  const prefix = `GB-${dateStr}-`;

  // Fetch highest order sequence for today
  const { data: latestToday } = await supabase
    .from("orders")
    .select("order_number")
    .like("order_number", `${prefix}%`)
    .order("order_number", { ascending: false })
    .limit(1);

  let seq = 1;
  if (latestToday && latestToday.length > 0 && latestToday[0].order_number) {
    const parts = latestToday[0].order_number.split("-");
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      seq = lastSeq + 1;
    }
  }

  let orderNumber = `${prefix}${String(seq).padStart(4, "0")}`;

  // Prepare notes with payment metadata & location link
  let formattedNotes = data.notes?.trim() || "";
  if (data.payment_method === "razorpay" && data.razorpay_payment_id) {
    formattedNotes = `[PAID ONLINE via Razorpay | Ref: ${data.razorpay_payment_id}] ${formattedNotes}`.trim();
  } else {
    formattedNotes = `[PAYMENT: Cash on Delivery] ${formattedNotes}`.trim();
  }

  const mapLink =
    data.location_link?.trim() ||
    (data.gps_lat != null && data.gps_lng != null
      ? `https://www.google.com/maps?q=${data.gps_lat},${data.gps_lng}`
      : "");

  if (mapLink) {
    formattedNotes = `${formattedNotes} [Location: ${mapLink}]`.trim();
  }

  const orderStatus = "pending";
  const orderId = crypto.randomUUID();

  // Create order in DB using explicit UUID with sequence collision safety
  let inserted = false;
  let attempts = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let lastOrderError: any = null;

  while (!inserted && attempts < 5) {
    attempts++;
    const { error: orderError } = await supabase
      .from("orders")
      .insert({
        id: orderId,
        order_number: orderNumber,
        customer_id: user?.id ?? null,
        status: orderStatus,
        subtotal: data.subtotal,
        delivery_fee: data.deliveryFee,
        gst_total: data.gstTotal ?? 0,
        total: data.total,
        customer_name: data.customer_name,
        phone: data.phone,
        email: data.email || null,
        address: data.address,
        city: data.city,
        pincode: data.pincode,
        notes: formattedNotes || null,
        gps_lat: data.gps_lat ?? null,
        gps_lng: data.gps_lng ?? null,
      });

    if (!orderError) {
      inserted = true;
    } else if (orderError.code === "23505" || orderError.message?.includes("unique")) {
      seq++;
      orderNumber = `${prefix}${String(seq).padStart(4, "0")}`;
    } else {
      lastOrderError = orderError;
      break;
    }
  }

  if (!inserted) {
    console.error("Order creation error:", lastOrderError);
    return {
      success: false,
      error: lastOrderError?.message || "Failed to create order. Please try again.",
    };
  }

  // Create order items with safe UUID parsing and GST snapshot
  const orderItems = data.items.map((item) => {
    const lineTotal = item.price * item.quantity;
    const gstRate = item.gstPercentage ? Number(item.gstPercentage) : 0;
    const gstAmt =
      item.gstAmount != null
        ? Number(item.gstAmount)
        : Math.round(((lineTotal * gstRate) / 100 + Number.EPSILON) * 100) / 100;

    return {
      id: crypto.randomUUID(),
      order_id: orderId,
      product_id: isUUID(item.productId) ? item.productId : null,
      variant_id: isUUID(item.variantId) ? item.variantId : null,
      product_name_snapshot: item.productName,
      variant_label_snapshot: item.variantLabel,
      unit_price: item.price,
      quantity: item.quantity,
      line_total: lineTotal,
      gst_percentage_snapshot: gstRate,
      gst_amount: gstAmt,
    };
  });

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("Order items error:", itemsError);
  } else {
    // Decrement variant stock quantities
    try {
      for (const item of data.items) {
        if (isUUID(item.variantId)) {
          const { data: cur } = await supabase
            .from("product_variants")
            .select("stock_quantity")
            .eq("id", item.variantId)
            .single();
          if (cur && typeof cur.stock_quantity === "number") {
            const newQty = Math.max(0, cur.stock_quantity - item.quantity);
            await supabase
              .from("product_variants")
              .update({ stock_quantity: newQty })
              .eq("id", item.variantId);
          }
        }
      }
    } catch (stockErr) {
      console.error("Failed to decrement variant stock:", stockErr);
    }
  }

  // Trigger Brevo SMTP email notifications synchronously before response
  try {
    await sendOrderEmails({
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
      gstTotal: data.gstTotal ?? 0,
      deliveryFee: data.deliveryFee,
      total: data.total,
    });
  } catch (err) {
    console.error("Email notification failed:", err);
  }

  return { success: true, orderNumber };
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  try {
    const supabase = await createClient();

    // Verify calling user is admin or staff
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin" && profile?.role !== "staff") {
      return { success: false, error: "Forbidden: Admin or staff only" };
    }

    const adminClient = createAdminClient();

    // 1. Update order status in DB and fetch order details for delivery email
    const { data: order, error } = await (adminClient as any)
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId)
      .select(`
        id, order_number, customer_name, email, total,
        order_items (
          product_name_snapshot, variant_label_snapshot, quantity,
          products (image_url)
        )
      `)
      .single();

    if (error) {
      console.error("Failed to update order status:", error);
      return { success: false, error: error.message };
    }

    // 2. If status is updated to 'delivered' and customer entered an email, send Delivery Email!
    if (newStatus === "delivered" && order?.email) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedItems = ((order as any).order_items || []).map((i: any) => ({
        productName: i.product_name_snapshot,
        variantLabel: i.variant_label_snapshot,
        quantity: i.quantity,
        imageUrl: i.products?.image_url || null,
      }));

      sendDeliveryConfirmationEmail({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        email: order.email,
        total: order.total,
        items: formattedItems,
      }).catch((err) => console.error("Failed to send delivery email:", err));
    }

    return { success: true };
  } catch (err: any) {
    console.error("updateOrderStatus exception:", err);
    return { success: false, error: err.message || "Failed to update status" };
  }
}

const ManualOrderSchema = z.object({
  customer_name: z.string().min(2, "Customer name must be at least 2 characters").max(100),
  phone: z.string().min(7, "Enter a valid phone number (at least 7 digits)"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().min(3, "Address is required").max(500),
  city: z.string().min(2, "City / Area is required").max(100),
  pincode: z.string().max(10).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
  payment_method: z.string().default("cod"),
  order_status: z.enum(["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]).default("confirmed"),
  items: z.array(
    z.object({
      productId: z.string().optional().nullable(),
      variantId: z.string().optional().nullable(),
      productName: z.string().min(1, "Product name is required"),
      variantLabel: z.string().min(1, "Size / Variant is required"),
      price: z.number().nonnegative("Price cannot be negative"),
      quantity: z.number().int().positive("Quantity must be at least 1"),
      imageUrl: z.string().optional().nullable(),
      gstPercentage: z.number().optional().nullable(),
      gstAmount: z.number().optional().nullable(),
    })
  ).min(1, "At least one product item is required in the order"),
  subtotal: z.number().nonnegative(),
  gstTotal: z.number().nonnegative().optional().default(0),
  deliveryFee: z.number().nonnegative().default(0),
  total: z.number().nonnegative(),
  isWhatsAppOrder: z.boolean().default(true),
});

export type ManualOrderFormData = z.infer<typeof ManualOrderSchema>;

export type CreateManualOrderResult =
  | { success: true; orderNumber: string; orderId: string; createdOrder: any }
  | { success: false; error: string };

export async function createManualAdminOrder(
  formData: ManualOrderFormData
): Promise<CreateManualOrderResult> {
  try {
    const supabase = await createClient();

    // Verify session & role (Admin or Staff)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized: Please log in." };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin" && profile?.role !== "staff") {
      return { success: false, error: "Forbidden: Admin or Staff workspace access required." };
    }

    const parsed = ManualOrderSchema.safeParse(formData);
    if (!parsed.success) {
      console.error("Manual Order Zod Validation Error:", parsed.error.format());
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid manual order data",
      };
    }

    const data = parsed.data;
    const adminClient = createAdminClient();

    // Generate date-based order number: GB-YYMMDD-0001
    const now = new Date();
    const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const yy = String(istTime.getUTCFullYear()).slice(2);
    const mm = String(istTime.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(istTime.getUTCDate()).padStart(2, "0");
    const dateStr = `${yy}${mm}${dd}`;
    const prefix = `GB-${dateStr}-`;

    // Fetch highest order sequence for today
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: latestToday } = await (adminClient as any)
      .from("orders")
      .select("order_number")
      .like("order_number", `${prefix}%`)
      .order("order_number", { ascending: false })
      .limit(1);

    let seq = 1;
    if (latestToday && latestToday.length > 0 && latestToday[0].order_number) {
      const parts = latestToday[0].order_number.split("-");
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        seq = lastSeq + 1;
      }
    }

    let orderNumber = `${prefix}${String(seq).padStart(4, "0")}`;

    // Format notes with staff & channel metadata
    const creatorInfo = `${profile.role.toUpperCase()}: ${profile.full_name || user.email}`;
    const sourceTag = data.isWhatsAppOrder ? "[WhatsApp Order]" : "[Manual / Staff Order]";
    const paymentTag = `[Payment: ${data.payment_method}]`;
    const userNotes = data.notes?.trim() || "";

    const formattedNotes = `${sourceTag} ${paymentTag} (Taken by ${creatorInfo}) ${userNotes}`.trim();

    const orderId = crypto.randomUUID();
    let inserted = false;
    let attempts = 0;
    let lastOrderError: any = null;

    while (!inserted && attempts < 5) {
      attempts++;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: orderError } = await (adminClient as any)
        .from("orders")
        .insert({
          id: orderId,
          order_number: orderNumber,
          customer_id: null,
          status: data.order_status,
          subtotal: data.subtotal,
          delivery_fee: data.deliveryFee,
          gst_total: data.gstTotal ?? 0,
          total: data.total,
          customer_name: data.customer_name,
          phone: data.phone,
          email: data.email || null,
          address: data.address,
          city: data.city,
          pincode: data.pincode || "680001",
          notes: formattedNotes || null,
        });

      if (!orderError) {
        inserted = true;
      } else if (orderError.code === "23505" || orderError.message?.includes("unique")) {
        seq++;
        orderNumber = `${prefix}${String(seq).padStart(4, "0")}`;
      } else {
        lastOrderError = orderError;
        break;
      }
    }

    if (!inserted) {
      console.error("Manual order creation DB error:", lastOrderError);
      return {
        success: false,
        error: lastOrderError?.message || "Failed to create manual order in database.",
      };
    }

    // Insert order items with GST snapshot
    const orderItems = data.items.map((item) => {
      const lineTotal = item.price * item.quantity;
      const gstRate = item.gstPercentage ? Number(item.gstPercentage) : 0;
      const gstAmt =
        item.gstAmount != null
          ? Number(item.gstAmount)
          : Math.round(((lineTotal * gstRate) / 100 + Number.EPSILON) * 100) / 100;

      return {
        id: crypto.randomUUID(),
        order_id: orderId,
        product_id: isUUID(item.productId) ? item.productId : null,
        variant_id: isUUID(item.variantId) ? item.variantId : null,
        product_name_snapshot: item.productName,
        variant_label_snapshot: item.variantLabel,
        unit_price: item.price,
        quantity: item.quantity,
        line_total: lineTotal,
        gst_percentage_snapshot: gstRate,
        gst_amount: gstAmt,
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: itemsError } = await (adminClient as any)
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Manual order items insertion error:", itemsError);
    } else {
      // Decrement stock for matched standard variants
      try {
        for (const item of data.items) {
          if (isUUID(item.variantId)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: cur } = await (adminClient as any)
              .from("product_variants")
              .select("stock_quantity")
              .eq("id", item.variantId)
              .single();
            if (cur && typeof cur.stock_quantity === "number") {
              const newQty = Math.max(0, cur.stock_quantity - item.quantity);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (adminClient as any)
                .from("product_variants")
                .update({ stock_quantity: newQty })
                .eq("id", item.variantId);
            }
          }
        }
      } catch (stockErr) {
        console.error("Failed to decrement variant stock for manual order:", stockErr);
      }
    }

    // If customer has an email, send confirmation email
    if (data.email) {
      try {
        await sendOrderEmails({
          orderNumber,
          customerName: data.customer_name,
          phone: data.phone,
          email: data.email,
          address: data.address,
          city: data.city,
          pincode: data.pincode || "680001",
          notes: data.notes,
          paymentMethod: data.payment_method === "razorpay" ? "razorpay" : "cod",
          items: data.items.map((it) => ({
            productId: it.productId || "",
            variantId: it.variantId || "",
            productName: it.productName,
            variantLabel: it.variantLabel,
            price: it.price,
            quantity: it.quantity,
            imageUrl: it.imageUrl,
          })),
          subtotal: data.subtotal,
          gstTotal: data.gstTotal ?? 0,
          deliveryFee: data.deliveryFee,
          total: data.total,
        });
      } catch (emailErr) {
        console.error("Failed to send manual order email:", emailErr);
      }
    }

    const createdOrder = {
      id: orderId,
      order_number: orderNumber,
      customer_name: data.customer_name,
      phone: data.phone,
      email: data.email || null,
      address: data.address,
      city: data.city,
      pincode: data.pincode || "680001",
      notes: formattedNotes,
      status: data.order_status,
      subtotal: data.subtotal,
      delivery_fee: data.deliveryFee,
      gst_total: data.gstTotal ?? 0,
      total: data.total,
      created_at: new Date().toISOString(),
      order_items: orderItems,
    };

    return {
      success: true,
      orderNumber,
      orderId,
      createdOrder,
    };
  } catch (err: any) {
    console.error("createManualAdminOrder exception:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred while creating manual order.",
    };
  }
}
