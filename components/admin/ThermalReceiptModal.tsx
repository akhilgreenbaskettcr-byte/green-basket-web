"use client";

import { useState, useEffect } from "react";
import { Printer, X } from "lucide-react";
import type { AdminOrderWithItems } from "@/components/admin/AdminOrdersClient";

interface ThermalReceiptModalProps {
  order: AdminOrderWithItems | null;
  onClose: () => void;
  storePhone?: string;
}

export function ThermalReceiptModal({
  order,
  onClose,
}: ThermalReceiptModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  // Lock background scroll (body, html, and admin layout <main> scroll container)
  useEffect(() => {
    if (!order) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // In the admin dashboard, <main> is the overflowing scrollable element
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

  // Format Date (DD-MM-YYYY) and Time (HH:MM AM/PM)
  const orderDate = new Date(order.created_at);
  const day = String(orderDate.getDate()).padStart(2, "0");
  const month = String(orderDate.getMonth() + 1).padStart(2, "0");
  const year = orderDate.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

  const formattedTime = orderDate
    .toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();

  // Determine Payment Mode
  const isOnlinePaid =
    order.notes?.toLowerCase().includes("paid online") ||
    order.notes?.toLowerCase().includes("razorpay");
  const paymentModeText = isOnlinePaid ? "Online (Paid)" : "Cash on Delivery";

  // Clean customer note if any (strip system payment tags)
  const customerNote = order.notes
    ? order.notes
        .replace(/\[PAID ONLINE.*?\]/gi, "")
        .replace(/\[PAYMENT:.*?\]/gi, "")
        .trim()
    : "";

  // Calculate total quantities
  const totalQty = (order.order_items || []).reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );
  const totalItemsCount = order.order_items?.length || 0;

  const handlePrint = () => {
    setIsPrinting(true);

    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Order-${order.order_number}</title>
  <style>
    @page {
      size: 58mm auto;
      margin: 0mm;
    }
    @media print {
      html, body {
        width: 58mm !important;
        max-width: 58mm !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
        color: #000 !important;
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
      width: 58mm;
      max-width: 58mm;
      margin: 0 auto;
      padding: 3mm 2mm 6mm 2mm;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Courier New", Courier, monospace;
      font-size: 11px;
      line-height: 1.25;
      color: #000;
      background: #fff;
    }
    .center {
      text-align: center;
    }
    .bold {
      font-weight: 700;
    }
    .order-no {
      font-size: 12.5px;
      font-weight: 800;
      margin-bottom: 2px;
      letter-spacing: 0.2px;
    }
    .store-name {
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.2px;
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
    .items-table th.qty, .items-table td.qty {
      text-align: right;
      width: 25%;
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
    .customer-box {
      font-size: 11px;
      line-height: 1.35;
      margin: 3px 0;
    }
  </style>
</head>
<body>
  <div class="center">
    <div class="order-no">Order Number: ${order.order_number}</div>
    <div class="store-name">Green Basket Tcr</div>
  </div>

  <div class="line-solid"></div>

  <div class="meta-row">
    <span>Date: ${formattedDate}</span>
    <span>Time: ${formattedTime}</span>
  </div>

  <div class="line-solid"></div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Item</th>
        <th class="qty">Qty</th>
      </tr>
    </thead>
    <tbody>
      ${(order.order_items || [])
        .map(
          (item) => `
        <tr>
          <td>
            <span class="item-name">${item.product_name_snapshot}</span>
            ${
              item.variant_label_snapshot
                ? `<span class="item-variant">${item.variant_label_snapshot}</span>`
                : ""
            }
          </td>
          <td class="qty bold">${item.quantity}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="line-solid"></div>

  <div class="summary-row">
    <span>Items: ${totalItemsCount}</span>
    <span>Total Qty: ${totalQty}</span>
  </div>

  <div class="line-solid"></div>

  <div class="customer-box">
    <div><strong>Payment Mode:</strong> ${paymentModeText}</div>
    <div style="margin-top: 2px;"><strong>Customer:</strong> ${order.customer_name}</div>
    ${customerNote ? `<div style="margin-top: 2px;"><strong>Note:</strong> ${customerNote}</div>` : ""}
  </div>
</body>
</html>
`;

    // Create an invisible iframe for completely clean 58mm printing
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      setIsPrinting(false);
      return;
    }

    doc.open();
    doc.write(printContent);
    doc.close();

    // Trigger print
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error("Print error:", err);
      } finally {
        setTimeout(() => {
          document.body.removeChild(iframe);
          setIsPrinting(false);
        }, 1000);
      }
    }, 250);
  };

  return (
    <div
      className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 overscroll-contain"
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
              Farm & Packing Order Slip (58mm)
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
              <span>{isPrinting ? "Printing..." : "Print Slip"}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Realistic Thermal Receipt Paper Scroll Preview */}
        <div className="flex-1 overflow-y-auto py-2 px-1 flex justify-center bg-gray-100/70 rounded-2xl border border-gray-200/80 my-3 overscroll-contain">
          <div
            id="thermal-receipt-preview"
            className="w-[280px] bg-white text-black p-4 shadow-md border border-gray-200/80 font-mono text-[11px] leading-tight select-none my-2 transition-all"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Courier New", monospace',
            }}
          >
            {/* Store & Bill Header */}
            <div className="text-center">
              <div className="font-extrabold text-[12.5px] tracking-tight">
                Order Number: {order.order_number}
              </div>
              <div className="font-black text-[14px] tracking-tight mt-0.5">
                Green Basket Tcr
              </div>
            </div>

            {/* Solid Line */}
            <div className="border-b border-black my-1.5" />

            {/* Date & Time */}
            <div className="flex justify-between text-[10.5px]">
              <span>Date: {formattedDate}</span>
              <span>Time: {formattedTime}</span>
            </div>

            {/* Solid Line */}
            <div className="border-b border-black my-1.5" />

            {/* Items Table (Only Name & Quantity, No Price) */}
            <table className="w-full text-[10.5px] border-collapse">
              <thead>
                <tr className="font-bold text-left border-b border-black">
                  <th className="pb-1 font-extrabold">Item</th>
                  <th className="pb-1 text-right w-[25%] font-extrabold">Qty</th>
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
                    <td className="py-1.5 text-right font-black text-[11.5px]">
                      {item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Solid Line */}
            <div className="border-b border-black my-1.5" />

            {/* Items & Qty Summary */}
            <div className="flex justify-between text-[10.5px] font-bold">
              <span>Items: {totalItemsCount}</span>
              <span>Total Qty: {totalQty}</span>
            </div>

            {/* Solid Line */}
            <div className="border-b border-black my-1.5" />

            {/* Payment Mode & Customer */}
            <div className="text-[11px] leading-tight space-y-1 text-gray-900">
              <div>
                <strong className="font-bold">Payment Mode:</strong>{" "}
                <span>{paymentModeText}</span>
              </div>
              <div>
                <strong className="font-bold">Customer:</strong>{" "}
                {order.customer_name}
              </div>
              {customerNote && (
                <div className="pt-0.5 text-[10px]">
                  <strong className="font-bold">Note:</strong> {customerNote}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-gray-500">
            Farm Packing Slip • 58mm Thermal Roll
          </p>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="btn-primary text-xs py-2 px-5 shadow-xs flex items-center gap-2"
          >
            <Printer size={15} />
            <span>{isPrinting ? "Printing..." : "Print Slip (58mm)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
