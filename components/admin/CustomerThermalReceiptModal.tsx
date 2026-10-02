"use client";

import { useState, useEffect } from "react";
import { Printer, X } from "lucide-react";
import type { AdminOrderWithItems } from "@/components/admin/AdminOrdersClient";
import { generateUpiQrCodeDataUrl } from "@/lib/upi";

interface CustomerThermalReceiptModalProps {
  order: AdminOrderWithItems | null;
  onClose: () => void;
  storePhone?: string;
  upiId?: string;
  payeeName?: string;
}

export function CustomerThermalReceiptModal({
  order,
  onClose,
  storePhone = "+91 98765 43210",
  upiId = "greenbasket@okaxis",
  payeeName = "Green Basket TCR",
}: CustomerThermalReceiptModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Lock background scroll
  useEffect(() => {
    if (!order) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const mainEl = document.querySelector("main");
    const originalMainOverflow = mainEl ? mainEl.style.overflow : "";
    if (mainEl) {
      mainEl.style.overflow = "hidden";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      if (mainEl) {
        mainEl.style.overflow = originalMainOverflow;
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [order, onClose]);

  // Payment Status Determination
  const isPaid = Boolean(
    order?.notes?.toLowerCase().includes("paid online") ||
    order?.notes?.toLowerCase().includes("razorpay") ||
    order?.notes?.toLowerCase().includes("upi_paid") ||
    order?.notes?.toLowerCase().includes("already paid") ||
    (order?.notes?.toLowerCase().includes("paid") && !order?.notes?.toLowerCase().includes("unpaid"))
  );
  const paymentModeText = isPaid ? "PAID" : "CASH ON DELIVERY";

  // Generate UPI QR code for unpaid orders
  useEffect(() => {
    if (!order || isPaid) {
      setQrDataUrl("");
      return;
    }

    let isMounted = true;
    generateUpiQrCodeDataUrl(
      {
        upiId,
        payeeName,
        amount: Number(order.total) || 0,
        orderNumber: order.order_number,
        note: `Green Basket Bill #${order.order_number}`,
      },
      200
    ).then((dataUrl) => {
      if (isMounted) {
        setQrDataUrl(dataUrl);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [order, isPaid, upiId, payeeName]);

  if (!order) return null;

  // Format Date & Time
  const orderDate = new Date(order.created_at);
  const formattedDate = orderDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = orderDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const cleanCustomerPhone = order.phone.replace(/\D/g, "");

  const handlePrint = () => {
    setIsPrinting(true);

    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Customer-Bill-${order.order_number}</title>
  <style>
    @page {
      size: 48mm auto;
      margin: 0;
    }
    @media print {
      html, body {
        width: 48mm !important;
        max-width: 48mm !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
        color: #000 !important;
        overflow: visible !important;
      }
      .receipt-wrapper {
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        margin: 0 !important;
        padding: 2mm 2mm 4mm 2mm !important;
        overflow: visible !important;
      }
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      width: 48mm;
      max-width: 48mm;
      height: auto;
      margin: 0 auto;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Courier New", Courier, monospace;
      font-size: 11px;
      line-height: 1.25;
      color: #000;
      background: #fff;
      overflow: visible;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .receipt-wrapper {
      width: 100%;
      max-width: 100%;
      height: auto;
      margin: 0;
      padding: 2mm 2mm 4mm 2mm;
      overflow: visible;
    }
    .center { text-align: center; }
    .bold { font-weight: 700; }
    .store-logo {
      max-height: 16mm;
      max-width: 42mm;
      height: auto;
      margin: 0 auto 3px auto;
      display: block;
      object-fit: contain;
    }
    .store-name {
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.2px;
      text-transform: uppercase;
      margin-bottom: 1px;
    }
    .store-tagline {
      font-size: 9.5px;
      margin: 1px 0;
    }
    .store-address {
      font-size: 9px;
      margin: 1px 0;
    }
    .line-solid {
      border-bottom: 1.2px solid #000;
      margin: 3.5px 0;
    }
    .line-dashed {
      border-bottom: 1.5px dashed #000;
      margin: 4.5px 0;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      margin: 1.5px 0;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 2px 0;
    }
    .items-table th {
      font-size: 11px;
      font-weight: 800;
      padding: 3px 0;
      text-align: left;
    }
    .items-table th.qty-col {
      text-align: center;
      width: 12%;
      white-space: nowrap;
    }
    .items-table th.rate-col {
      text-align: right;
      width: 18%;
      white-space: nowrap;
    }
    .items-table th.amt-col {
      text-align: right;
      width: 20%;
      white-space: nowrap;
    }
    .items-table td {
      font-size: 11px;
      vertical-align: top;
      padding: 2.5px 0;
    }
    .item-name {
      font-weight: 700;
      line-height: 1.2;
      word-break: break-word;
    }
    .item-variant {
      font-size: 9.5px;
      font-weight: 600;
      color: #222;
      display: block;
      margin-top: 1px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      font-weight: 700;
      margin: 2px 0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 900;
      margin: 3px 0;
    }
    .payment-tag {
      text-align: center;
      font-weight: 800;
      font-size: 10.5px;
      border: 1.2px solid #000;
      padding: 2px;
      margin: 4px 0;
      text-transform: uppercase;
    }
    .qr-section {
      text-align: center;
      margin: 3px 0 1px 0;
      padding: 1px 0;
    }
    .qr-title {
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 0.3px;
      margin-bottom: 2px;
      text-transform: uppercase;
    }
    .qr-image {
      width: 22mm;
      height: 22mm;
      max-width: 90px;
      max-height: 90px;
      margin: 0 auto;
      display: block;
      image-rendering: pixelated;
    }
    .upi-id-text {
      font-size: 8.5px;
      font-weight: 800;
      margin-top: 2px;
      letter-spacing: 0.2px;
      word-break: break-all;
    }
    .footer {
      text-align: center;
      font-size: 9px;
      margin-top: 4px;
      padding-top: 2px;
    }
    .tear-feed {
      margin-top: 10px;
      text-align: center;
      line-height: 1.5;
    }
    .feed-dot {
      font-size: 7px;
      letter-spacing: 3px;
      color: #333;
      margin-top: 8px;
    }
    .feed-cut {
      font-size: 8px;
      letter-spacing: 1px;
      font-weight: 700;
      color: #000;
      margin-top: 10px;
      padding-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="receipt-wrapper">
    <div class="center">
      <img src="/images/logo/Green-basket-logo.png" alt="Green Basket" class="store-logo" />
      <div class="store-name">GREEN BASKET TCR</div>
      <div class="store-tagline">Ayyanthole</div>
      <div class="store-address">Thrissur, Kerala • Tel: ${storePhone}</div>
    </div>

    <div class="line-dashed"></div>

    <div class="meta-row">
      <span><strong>BILL NO:</strong></span>
      <span><strong>${order.order_number}</strong></span>
    </div>
    <div class="meta-row">
      <span>Date: ${formattedDate}</span>
      <span>Time: ${formattedTime}</span>
    </div>

    <div class="line-dashed"></div>

    <div class="meta-row">
      <span>Customer:</span>
      <span class="bold">${order.customer_name}</span>
    </div>
    <div class="meta-row">
      <span>Mobile:</span>
      <span>${order.phone}</span>
    </div>
    ${order.city
        ? `<div class="meta-row"><span>Area:</span><span>${order.city}</span></div>`
        : ""
      }

    <div class="line-solid"></div>

    <table class="items-table">
      <thead>
        <tr>
          <th>ITEM</th>
          <th class="qty-col">QTY</th>
          <th class="rate-col">RATE</th>
          <th class="amt-col">AMT</th>
        </tr>
      </thead>
      <tbody>
        ${(order.order_items || [])
        .map(
          (item) => `
          <tr>
            <td>
              <div class="item-name">${item.product_name_snapshot}</div>
              ${item.variant_label_snapshot ? `<span class="item-variant">${item.variant_label_snapshot}</span>` : ""}
            </td>
            <td style="text-align: center; font-weight: 700;">${item.quantity}</td>
            <td style="text-align: right;">${Number(item.unit_price).toFixed(0)}</td>
            <td style="text-align: right; font-weight: 700;">${Number(item.line_total).toFixed(0)}</td>
          </tr>
        `)
        .join("")}
      </tbody>
    </table>

    <div class="line-solid"></div>

    <div class="summary-row">
      <span>Subtotal:</span>
      <span>₹${Number(order.subtotal).toFixed(0)}</span>
    </div>
    ${(order as any).gst_total > 0
        ? `<div class="summary-row"><span>GST Taxes:</span><span>₹${Number((order as any).gst_total).toFixed(0)}</span></div>`
        : ""
      }
    <div class="summary-row">
      <span>Delivery Fee:</span>
      <span>${order.delivery_fee > 0 ? `₹${Number(order.delivery_fee).toFixed(0)}` : "FREE"}</span>
    </div>

    <div class="line-dashed"></div>

    <div class="total-row">
      <span>TOTAL:</span>
      <span>₹${Number(order.total).toFixed(0)}</span>
    </div>

    <div class="payment-tag">
      ${paymentModeText}
    </div>

    ${!isPaid && qrDataUrl
        ? `
      <div class="line-dashed"></div>
      <div class="qr-section">
        <div class="qr-title">SCAN & PAY WITH ANY UPI APP</div>
        <img src="${qrDataUrl}" alt="UPI QR" class="qr-image" />
        <div class="upi-id-text">UPI: ${upiId}</div>
        <div style="font-size: 8px; font-weight: 600; margin-top: 1px;">GPay • PhonePe • Paytm • BHIM</div>
      </div>
      `
        : ""
      }

    <div class="footer">
      <p>Thank you for shopping with us!</p>
      <p>Visit again • www.greenbaskettcr.com</p>
    </div>

    <div class="tear-feed">
      <div class="feed-dot">. . . . . . . . . . . . . . . .</div>
      <div class="feed-dot">. . . . . . . . . . . . . . . .</div>
      <div class="feed-cut">✂ - - - - - - - - - - - - - ✂</div>
    </div>
  </div>
</body>
</html>
    `;


    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(printContent);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setIsPrinting(false);
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 300);
    } else {
      setIsPrinting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[450] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overscroll-contain"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col overscroll-contain">
        {/* Header Actions */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gb-green">
              Customer Bill
            </span>
            <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <Printer size={18} className="text-gb-green" />
              Order #{order.order_number}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="btn-primary text-xs py-2 px-4 shadow-sm flex items-center gap-1.5"
            >
              <Printer size={14} />
              <span>{isPrinting ? "Printing..." : "Print Bill"}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Receipt Paper Preview */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col items-center bg-gray-100/70 rounded-2xl border border-gray-200/80 my-3 overscroll-contain min-h-0">
          <div
            id="customer-receipt-preview"
            className="w-[280px] min-w-[280px] max-w-[280px] h-auto bg-white text-black p-4 shadow-md border border-gray-200/80 font-mono text-[11px] leading-tight select-none my-1 shrink-0 rounded-xs transition-all"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Courier New", monospace',
            }}
          >
            {/* Store & Bill Header */}
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo/Green-basket-logo.png"
                alt="Green Basket Logo"
                className="h-11 w-auto mx-auto mb-1.5 object-contain"
              />
              <div className="font-black text-[14px] tracking-tight">
                GREEN BASKET TCR
              </div>
              <div className="text-[9.5px] text-gray-600 mt-0.5">
                Ayyanthole, Thrissur, Kerala
              </div>
              <div className="text-[9px] text-gray-500 mt-0.5">
                Phone: {storePhone}
              </div>
            </div>

            {/* Dashed Line */}
            <div className="border-b border-dashed border-black my-1.5" />

            {/* Bill Info */}
            <div className="flex justify-between text-[10.5px] font-bold">
              <span>BILL NO:</span>
              <span>{order.order_number}</span>
            </div>
            <div className="flex justify-between text-[10.5px]">
              <span>Date: {formattedDate}</span>
              <span>Time: {formattedTime}</span>
            </div>

            {/* Dashed Line */}
            <div className="border-b border-dashed border-black my-1.5" />

            {/* Customer Info */}
            <div className="flex justify-between text-[10.5px]">
              <span>Customer:</span>
              <span className="font-bold">{order.customer_name}</span>
            </div>
            <div className="flex justify-between text-[10.5px]">
              <span>Mobile:</span>
              <span>{order.phone}</span>
            </div>
            {order.city && (
              <div className="flex justify-between text-[10.5px]">
                <span>Area:</span>
                <span>{order.city}</span>
              </div>
            )}

            {/* Solid Line */}
            <div className="border-b border-black my-1.5" />

            {/* Items Table with Pricing */}
            <table className="w-full text-[10.5px] border-collapse">
              <thead>
                <tr className="font-bold text-left border-b border-black">
                  <th className="pb-1 font-extrabold">Item</th>
                  <th className="pb-1 text-center w-[12%] font-extrabold">Qty</th>
                  <th className="pb-1 text-right w-[18%] font-extrabold">Rate</th>
                  <th className="pb-1 text-right w-[20%] font-extrabold">Amt</th>
                </tr>
              </thead>
              <tbody>
                {(order.order_items || []).map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="py-1.5 pr-1 font-medium leading-tight">
                      <div className="font-bold">{item.product_name_snapshot}</div>
                      {item.variant_label_snapshot && (
                        <div className="text-[9.5px] font-semibold text-gray-700">
                          {item.variant_label_snapshot}
                        </div>
                      )}
                    </td>
                    <td className="py-1.5 text-center font-black text-[11.5px]">
                      {item.quantity}
                    </td>
                    <td className="py-1.5 text-right text-[10.5px]">
                      {Number(item.unit_price).toFixed(0)}
                    </td>
                    <td className="py-1.5 text-right font-black text-[11.5px]">
                      {Number(item.line_total).toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Solid Line */}
            <div className="border-b border-black my-1.5" />

            {/* Bill Summary */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10.5px] font-bold">
                <span>Subtotal:</span>
                <span>₹{Number(order.subtotal).toFixed(0)}</span>
              </div>
              {(order as any).gst_total > 0 && (
                <div className="flex justify-between text-[10.5px] font-bold">
                  <span>GST Taxes:</span>
                  <span>₹{Number((order as any).gst_total).toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between text-[10.5px] font-bold">
                <span>Delivery Fee:</span>
                <span>{order.delivery_fee > 0 ? `₹${Number(order.delivery_fee).toFixed(0)}` : "FREE"}</span>
              </div>
            </div>

            {/* Dashed Line */}
            <div className="border-b border-dashed border-black my-1.5" />

            {/* Total */}
            <div className="flex justify-between text-[13px] font-black">
              <span>TOTAL:</span>
              <span>₹{Number(order.total).toFixed(0)}</span>
            </div>

            {/* Payment Tag */}
            <div className="mt-2 text-center text-[10.5px] font-extrabold border border-black py-1 uppercase">
              {paymentModeText}
            </div>

            {/* UPI QR Code Section for Unpaid / COD Orders */}
            {!isPaid && qrDataUrl && (
              <>
                <div className="border-b border-dashed border-black my-2" />
                <div className="text-center my-1.5 flex flex-col items-center">
                  <div className="text-[9px] font-extrabold uppercase tracking-wide mb-1">
                    SCAN & PAY WITH ANY UPI APP
                  </div>
                  <div className="p-1 bg-white inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrDataUrl}
                      alt="UPI QR Code"
                      className="w-24 h-24 mx-auto object-contain"
                    />
                  </div>
                  <div className="text-[8.5px] font-bold tracking-tight text-gray-800 mt-1">
                    UPI ID: <span className="font-extrabold text-black">{upiId}</span>
                  </div>
                  <div className="text-[8px] text-gray-500 font-semibold mt-0.5">
                    GPay • PhonePe • Paytm • BHIM
                  </div>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="text-center text-[9px] mt-2 text-gray-700">
              <p>Thank you for shopping with us!</p>
              <p>Visit again • www.greenbaskettcr.com</p>
            </div>

            {/* Tear Line Guide */}
            <div className="text-center pt-3 pb-0.5 text-gray-400 select-none">
              <div className="text-[7px] tracking-[3px] text-gray-300 leading-none">. . . . . . . . . . . . . . . .</div>
              <div className="text-[7px] tracking-[3px] text-gray-300 leading-none mt-2">. . . . . . . . . . . . . . . .</div>
              <div className="text-[8px] tracking-[1.5px] text-gray-400 mt-2 border-b border-dashed border-gray-300 pb-0.5 font-bold">
                ✂ - - - - - - - - - - - - - ✂
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-gray-500">
            Customer Bill • 58mm Thermal Roll
          </p>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="btn-primary text-xs py-2 px-5 shadow-xs flex items-center gap-2"
          >
            <Printer size={15} />
            <span>{isPrinting ? "Printing..." : "Print Bill"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

