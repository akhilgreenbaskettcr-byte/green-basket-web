import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDeliveryQuote, quoteFailureMessage } from "@/lib/delivery/quote";

const BodySchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  items: z
    .array(z.object({ variantId: z.string().min(1), quantity: z.number().int().positive().max(1000) }))
    .min(1)
    .max(100),
});

// Lightweight per-IP rate limit (best-effort; per server instance).
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    if (hits.size > 5000) hits.clear();
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_REQUESTS;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  const quote = await getDeliveryQuote(parsed.data);

  if (!quote.available) {
    return NextResponse.json({
      success: true,
      available: false,
      reason: quote.reason,
      message: quoteFailureMessage(quote.reason),
    });
  }

  // Distance and rule details are intentionally NOT returned.
  return NextResponse.json({
    success: true,
    available: true,
    pincode: quote.pincode,
    areaName: quote.areaName,
    subtotal: quote.subtotal,
    gstTotal: quote.gstTotal,
    deliveryCharge: quote.deliveryCharge,
    total: quote.total,
  });
}
