import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/utils/supabase/server";
import { sendOrderEmails } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Razorpay webhook signature" },
        { status: 400 }
      );
    }

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!webhookSecret) {
      console.error("Razorpay webhook secret is not configured in environment");
      return NextResponse.json(
        { error: "Server webhook configuration missing" },
        { status: 500 }
      );
    }

    // Verify HMAC SHA256 Signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Invalid Razorpay webhook signature");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    console.log(`[Razorpay Webhook] Received event: ${eventType}`);

    // Handle payment.captured or order.paid
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const payment = event.payload?.payment?.entity;
      const order = event.payload?.order?.entity;

      const paymentId = payment?.id || "pay_unknown";
      const razorpayOrderId = payment?.order_id || order?.id || "";
      const notes = payment?.notes || order?.notes || {};

      const supabase = await createClient();

      // Check if order already recorded in database via client callback
      const { data: existingOrders } = await supabase
        .from("orders")
        .select("id, status, notes")
        .ilike("notes", `%${paymentId}%`)
        .limit(1);

      if (existingOrders && existingOrders.length > 0) {
        // Order exists: ensure status is marked confirmed
        const existing = existingOrders[0];
        if (existing.status === "pending") {
          await supabase
            .from("orders")
            .update({
              status: "confirmed",
              notes: existing.notes || `[PAID ONLINE via Razorpay | Ref: ${paymentId}]`,
            })
            .eq("id", existing.id);
          console.log(`[Razorpay Webhook] Order ${existing.id} updated to confirmed.`);
        }
        return NextResponse.json({ status: "ok", message: "Order updated" });
      }

      // FAILSAFE: If customer closed browser before callback, create the order from Webhook metadata!
      console.log(`[Razorpay Webhook] Creating missing order from webhook backup metadata...`);

      const customerName = notes.customer_name || payment?.contact || "Customer";
      const phone = notes.phone || payment?.contact || "";
      const email = notes.email || payment?.email || null;
      const address = notes.address || "Address provided during checkout";
      const city = notes.city || "Thrissur";
      const pincode = notes.pincode || "680001";
      const subtotal = Number(notes.subtotal) || Number(payment?.amount || 0) / 100;
      const deliveryFee = Number(notes.delivery_fee) || 0;
      const total = Number(notes.total) || Number(payment?.amount || 0) / 100;
      const deliveryNotes = notes.delivery_notes || "";

      // Generate order number
      const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
      const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
      const orderNumber = `GB-${dateStr}-${randomHex}`;
      const newOrderId = crypto.randomUUID();

      const formattedNotes = `[PAID ONLINE via Razorpay Webhook | Ref: ${paymentId} | OrderId: ${razorpayOrderId}] ${deliveryNotes}`.trim();

      const { error: insertOrderError } = await supabase.from("orders").insert({
        id: newOrderId,
        order_number: orderNumber,
        customer_id: null,
        status: "confirmed",
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total: total,
        customer_name: customerName,
        phone: phone,
        email: email,
        address: address,
        city: city,
        pincode: pincode,
        notes: formattedNotes,
      });

      if (insertOrderError) {
        console.error("[Razorpay Webhook] Failsafe order insertion error:", insertOrderError);
      } else {
        console.log(`[Razorpay Webhook] Failsafe order created successfully: ${orderNumber}`);
        
        let parsedItems = [];
        try {
          if (notes.items_json) {
            parsedItems = JSON.parse(notes.items_json);
          }
        } catch {
          parsedItems = [];
        }

        // Trigger Brevo SMTP notification
        try {
          await sendOrderEmails({
            orderNumber,
            customerName,
            phone,
            email,
            address,
            city,
            pincode,
            notes: deliveryNotes,
            paymentMethod: "razorpay",
            items: parsedItems,
            subtotal,
            deliveryFee,
            total,
          });
        } catch (e) {
          console.error("[Webhook Email Error]:", e);
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("[Razorpay Webhook] Exception processing event:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
