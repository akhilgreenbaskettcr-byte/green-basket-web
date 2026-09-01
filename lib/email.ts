import nodemailer from "nodemailer";

interface OrderItemPayload {
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  price: number;
  quantity: number;
}

interface OrderEmailPayload {
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  pincode: string;
  notes?: string | null;
  paymentMethod: "razorpay" | "cod";
  items: OrderItemPayload[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

// Create Nodemailer Transporter using Brevo SMTP
function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";

  return nodemailer.createTransport({
    host,
    port,
    secure: false, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
}

export async function sendOrderEmails(order: OrderEmailPayload) {
  try {
    const transporter = getTransporter();
    const fromEmail = process.env.SMTP_FROM_EMAIL || "akhilgreenbaskettcr@gmail.com";
    const fromName = process.env.SMTP_FROM_NAME || "Green Basket TCR";
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "info@greenbaskettcr.com, akhilgreenbaskettcr@gmail.com";
    const replyToEmail = process.env.REPLY_TO_EMAIL || "info@greenbaskettcr.com";

    const formattedPayment =
      order.paymentMethod === "razorpay"
        ? "💳 Online Payment (Razorpay)"
        : "💵 Cash on Delivery (COD)";

    const itemsHtml = order.items
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px 8px; font-size: 13px; color: #1f2937; font-weight: 500;">
            ${item.productName}
            <span style="display: block; font-size: 11px; color: #6b7280;">${item.variantLabel}</span>
          </td>
          <td style="padding: 10px 8px; font-size: 13px; color: #374151; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 10px 8px; font-size: 13px; color: #111827; font-weight: 600; text-align: right;">
            ₹${item.price * item.quantity}
          </td>
        </tr>`
      )
      .join("");

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order ${order.orderNumber}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <div style="background-color: #245B35; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">GREEN BASKET TCR</h1>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #bbf062; font-weight: 600; text-transform: uppercase;">Fresh Kerala Groceries Delivered</p>
          </div>

          <!-- Order Alert Banner -->
          <div style="background-color: #ecfdf5; border-bottom: 1px solid #d1fae5; padding: 14px 24px; text-align: center;">
            <p style="margin: 0; font-size: 14px; font-weight: 700; color: #065f46;">
              🛒 Order Received: <span style="font-family: monospace; font-size: 15px;">#${order.orderNumber}</span>
            </p>
          </div>

          <!-- Content Body -->
          <div style="padding: 24px;">
            
            <!-- Customer Details Card -->
            <div style="background-color: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 20px; border: 1px solid #f3f4f6;">
              <h2 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Customer & Delivery Details</h2>
              <table style="width: 100%; font-size: 13px; color: #374151;">
                <tr>
                  <td style="padding: 4px 0; font-weight: 600; width: 110px;">Name:</td>
                  <td style="padding: 4px 0; color: #111827; font-weight: 700;">${order.customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: 600;">Phone:</td>
                  <td style="padding: 4px 0;"><a href="tel:${order.phone}" style="color: #245B35; font-weight: 600; text-decoration: none;">${order.phone}</a></td>
                </tr>
                ${order.email ? `
                <tr>
                  <td style="padding: 4px 0; font-weight: 600;">Email:</td>
                  <td style="padding: 4px 0; color: #374151;">${order.email}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding: 4px 0; font-weight: 600; vertical-align: top;">Address:</td>
                  <td style="padding: 4px 0; color: #111827;">${order.address}, ${order.city} - <strong>${order.pincode}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-weight: 600;">Payment:</td>
                  <td style="padding: 4px 0; font-weight: 700; color: #047857;">${formattedPayment}</td>
                </tr>
                ${order.notes ? `
                <tr>
                  <td style="padding: 4px 0; font-weight: 600; vertical-align: top;">Notes:</td>
                  <td style="padding: 4px 0; color: #4b5563; font-style: italic;">${order.notes}</td>
                </tr>` : ""}
              </table>
            </div>

            <!-- Ordered Items Table -->
            <div style="margin-bottom: 20px;">
              <h2 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Ordered Items</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f3f4f6; text-align: left;">
                    <th style="padding: 8px; font-size: 11px; font-weight: 700; color: #4b5563; text-transform: uppercase;">Item</th>
                    <th style="padding: 8px; font-size: 11px; font-weight: 700; color: #4b5563; text-transform: uppercase; text-align: center;">Qty</th>
                    <th style="padding: 8px; font-size: 11px; font-weight: 700; color: #4b5563; text-transform: uppercase; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <!-- Price Breakdown -->
            <div style="border-top: 2px dashed #e5e7eb; padding-top: 14px; margin-bottom: 24px;">
              <table style="width: 100%; font-size: 13px;">
                <tr>
                  <td style="padding: 4px 0; color: #6b7280;">Subtotal:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #374151;">₹${order.subtotal}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #6b7280;">Delivery Fee:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 600; color: ${order.deliveryFee === 0 ? "#059669" : "#374151"};">
                    ${order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
                  </td>
                </tr>
                <tr style="font-size: 16px;">
                  <td style="padding: 10px 0 0 0; font-weight: 800; color: #111827;">Total Amount:</td>
                  <td style="padding: 10px 0 0 0; text-align: right; font-weight: 800; color: #245B35;">₹${order.total}</td>
                </tr>
              </table>
            </div>

            <!-- Footer info -->
            <div style="text-align: center; border-top: 1px solid #f3f4f6; padding-top: 16px;">
              <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                Green Basket TCR • Near Ayyanthole Ground, Thrissur, Kerala - 680003
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #9ca3af;">
                Support: <a href="tel:+919048178886" style="color: #245B35; text-decoration: none; font-weight: 600;">+91 90481 78886</a> | <a href="mailto:info@greenbaskettcr.com" style="color: #245B35; text-decoration: none;">info@greenbaskettcr.com</a>
              </p>
            </div>

          </div>
        </div>
      </body>
      </html>
    `;

    // 1. Send Alert Email to Admin
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      replyTo: replyToEmail,
      to: adminEmail,
      subject: `🛒 New Order #${order.orderNumber} received — ₹${order.total} (${order.customerName})`,
      html: emailTemplate,
    });

    console.log(`[Brevo SMTP] Admin notification sent successfully for Order #${order.orderNumber}`);

    // 2. If Customer entered an email, send them their order confirmation receipt!
    if (order.email && order.email.includes("@")) {
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        replyTo: replyToEmail,
        to: order.email,
        subject: `Your Green Basket Order #${order.orderNumber} is Confirmed! 🥦`,
        html: emailTemplate,
      });
      console.log(`[Brevo SMTP] Customer confirmation sent to ${order.email}`);
    }

    return { success: true };
  } catch (error) {
    console.error("[Brevo SMTP Error] Failed to send order email:", error);
    return { success: false, error };
  }
}
