"use client";

import { useState, useEffect } from "react";
import { Printer, X } from "lucide-react";
import type { AdminOrderWithItems } from "@/components/admin/AdminOrdersClient";
import { formatPrice } from "@/lib/utils";

interface CustomerThermalReceiptModalProps {
  order: AdminOrderWithItems | null;
  onClose: () => void;
  storePhone?: string;
}

export function CustomerThermalReceiptModal({
  order,
  onClose,
  storePhone = "+91 98765 43210",
}: CustomerThermalReceiptModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);

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

  // Payment Status Text
  const isOnlinePaid =
    order.notes?.toLowerCase().includes("paid online") ||
    order.notes?.toLowerCase().includes("razorpay") ||
    order.notes?.toLowerCase().includes("upi_paid");
  const paymentModeText = isOnlinePaid ? "PAID (Online Verified)" : "CASH ON DELIVERY / UNPAID";

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
      size: 58mm auto;
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 58mm;
      max-width: 58mm;
      margin: 0 auto;
      padding: 3mm 2.5mm;
      font-family: 'Courier New', Courier, monospace, sans-serif;
      font-size: 11px;
      line-height: 1.25;
      color: #000;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .header {
      text-align: center;
      padding-bottom: 2mm;
    }
    .header h1 {
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 1mm;
    }
    .header p {
      font-size: 9.5px;
      margin: 0.5mm 0;
    }
    .divider {
      border-top: 1px dashed #000;
      margin: 2mm 0;
      width: 100%;
    }
    .divider-solid {
      border-top: 1px solid #000;
      margin: 2mm 0;
      width: 100%;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      margin: 0.5mm 0;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5mm 0;
    }
    .items-table th {
      font-size: 9.5px;
      border-bottom: 1px dashed #000;
      padding: 1mm 0;
      text-align: left;
    }
    .items-table td {
      padding: 1mm 0;
      vertical-align: top;
      font-size: 10px;
    }
    .item-name {
      font-weight: bold;
      word-break: break-word;
    }
    .item-variant {
      font-size: 9px;
      color: #333;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      margin: 0.8mm 0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 900;
      margin: 1.5mm 0;
    }
    .payment-tag {
      text-align: center;
      font-weight: bold;
      font-size: 10.5px;
      border: 1px solid #000;
      padding: 1.2mm;
      margin: 2mm 0;
      text-transform: uppercase;
    }
    .footer {
      text-align: center;
      font-size: 9px;
      margin-top: 2.5mm;
      padding-top: 1.5mm;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>GREEN BASKET</h1>
    <p>Fresh & Pure Farm Produce</p>
    <p>Thrissur, Kerala • Tel: ${storePhone}</p>
  </div>

  <div class="divider"></div>

  <div class="meta-row">
    <span><strong>BILL NO:</strong></span>
    <span><strong>${order.order_number}</strong></span>
  </div>
  <div class="meta-row">
    <span>Date: ${formattedDate}</span>
    <span>Time: ${formattedTime}</span>
  </div>

  <div class="divider"></div>

  <!-- Customer Compact Info -->
  <div class="meta-row">
    <span>Customer:</span>
    <span class="font-bold">${order.customer_name}</span>
  </div>
  <div class="meta-row">
    <span>Mobile:</span>
    <span>${order.phone}</span>
  </div>
  ${
    order.city
      ? `<div class="meta-row"><span>Area:</span><span>${order.city}</span></div>`
      : ""
  }

  <div class="divider-solid"></div>

  <!-- Itemized Pricing Table -->
  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 50%;">ITEM</th>
        <th style="width: 15%; text-align: center;">QTY</th>
        <th style="width: 15%; text-align: right;">RATE</th>
        <th style="width: 20%; text-align: right;">AMT</th>
      </tr>
    </thead>
    <tbody>
      ${(order.order_items || [])
        .map(
          (item) => `
        <tr>
          <td>
            <div class="item-name">${item.product_name_snapshot}</div>
            <div class="item-variant">${item.variant_label_snapshot}</div>
          </td>
          <td style="text-align: center; font-weight: bold;">${item.quantity}</td>
          <td style="text-align: right;">${Number(item.unit_price).toFixed(0)}</td>
          <td style="text-align: right; font-weight: bold;">${Number(item.line_total).toFixed(0)}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="divider-solid"></div>

  <!-- Bill Summary -->
  <div class="summary-row">
    <span>Subtotal:</span>
    <span>₹${Number(order.subtotal).toFixed(0)}</span>
  </div>
  ${
    (order as any).gst_total > 0
      ? `<div class="summary-row"><span>GST Taxes:</span><span>₹${Number((order as any).gst_total).toFixed(0)}</span></div>`
      : ""
  }
  <div class="summary-row">
    <span>Delivery Fee:</span>
    <span>${order.delivery_fee > 0 ? `₹${Number(order.delivery_fee).toFixed(0)}` : "FREE"}</span>
  </div>

  <div class="divider"></div>

  <div class="total-row">
    <span>TOTAL PAYABLE:</span>
    <span>₹${Number(order.total).toFixed(0)}</span>
  </div>

  <div class="payment-tag">
    ${paymentModeText}
  </div>

  <div class="footer">
    <p>Thank you for shopping with us!</p>
    <p>Visit again • www.greenbasket.in</p>
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
    <div className="fixed inset-0 z-[450] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">Customer Bill (58mm)</h3>
            <p className="text-xs text-gray-500 font-mono">Order {order.order_number}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 58mm Receipt Preview Paper Box */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 font-mono text-[11px] leading-relaxed text-gray-800 shadow-inner">
          <div className="text-center pb-2 border-b border-dashed border-gray-300">
            <h4 className="font-extrabold text-sm tracking-wide text-gray-900">
              GREEN BASKET
            </h4>
            <p className="text-[10px] text-gray-500">Fresh & Pure Produce</p>
          </div>

          <div className="py-2 space-y-1 text-[10px] border-b border-dashed border-gray-300">
            <div className="flex justify-between">
              <span>Bill: <strong>{order.order_number}</strong></span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Cust: {order.customer_name}</span>
              <span>{order.city || "Thrissur"}</span>
            </div>
          </div>

          {/* Items Preview */}
          <div className="py-2 border-b border-gray-300 space-y-1.5">
            {(order.order_items || []).map((item, idx) => (
              <div key={idx} className="flex justify-between text-[10px]">
                <div className="flex-1 pr-1 truncate">
                  <p className="font-bold text-gray-900">{item.product_name_snapshot}</p>
                  <p className="text-[9px] text-gray-500">{item.variant_label_snapshot} × {item.quantity}</p>
                </div>
                <span className="font-bold text-gray-900 shrink-0">
                  {formatPrice(item.line_total)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="py-2 space-y-1 text-[10px] border-b border-dashed border-gray-300">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {(order as any).gst_total > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>GST Taxes:</span>
                <span>{formatPrice((order as any).gst_total)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery:</span>
              <span>{order.delivery_fee > 0 ? formatPrice(order.delivery_fee) : "FREE"}</span>
            </div>
            <div className="flex justify-between text-xs font-black text-gray-900 pt-1">
              <span>TOTAL:</span>
              <span className="text-gb-green">{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="mt-2 text-center text-[10px] font-bold border border-gray-300 py-1 rounded-md text-gray-800">
            {paymentModeText}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            disabled={isPrinting}
            onClick={handlePrint}
            className="w-full py-3 px-4 bg-gb-green hover:bg-gb-green/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs shadow-sm transition-all hover:scale-[1.02]"
          >
            <Printer size={15} />
            <span>{isPrinting ? "Printing to 58mm..." : "Print 58mm Customer Bill"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
