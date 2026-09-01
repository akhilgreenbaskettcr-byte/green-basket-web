import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, receipt, customer_name, phone, email, address, city, pincode, notes, items, subtotal, deliveryFee, total } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Razorpay credentials not configured on the server",
        },
        { status: 500 }
      );
    }

    // Razorpay requires amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

    // Package order metadata into Razorpay notes for 100% webhook failsafe backup
    const orderNotes: Record<string, string> = {
      customer_name: String(customer_name || "").slice(0, 100),
      phone: String(phone || "").slice(0, 20),
      email: String(email || "").slice(0, 100),
      address: String(address || "").slice(0, 250),
      city: String(city || "Thrissur").slice(0, 50),
      pincode: String(pincode || "").slice(0, 10),
      delivery_notes: String(notes || "").slice(0, 200),
      subtotal: String(subtotal || amount),
      delivery_fee: String(deliveryFee || 0),
      total: String(total || amount),
    };

    // Include compact items summary
    if (items && Array.isArray(items)) {
      orderNotes.items_summary = items
        .map((i: any) => `${i.productName} (${i.variantLabel}) x${i.quantity}`)
        .join(", ")
        .slice(0, 250);
      orderNotes.items_json = JSON.stringify(items).slice(0, 450);
    }

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: receipt || `rcpt_${Date.now()}`,
        payment_capture: 1,
        notes: orderNotes,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Razorpay API Error:", data);
      return NextResponse.json(
        {
          success: false,
          error: data.error?.description || "Failed to create Razorpay order",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId: keyId,
    });
  } catch (error: any) {
    console.error("Razorpay Order Creation Exception:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
