"use client";

import { useState } from "react";
import { Printer, X, Check, MapPin } from "lucide-react";
import type { AdminOrderWithItems } from "@/components/admin/AdminOrdersClient";

interface ThermalReceiptModalProps {
  order: AdminOrderWithItems | null;
  onClose: () => void;
  storePhone?: string;
}

export function ThermalReceiptModal({
  order,
  onClose,
  storePhone = "7012909264",
}: ThermalReceiptModalProps) {
  const [includeAddress, setIncludeAddress] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!order) return null;

  // Format Date (DD-MM-YYYY) and Time (HH:MM AM/PM)
  const orderDate = new Date(order.created_at);
  const day = String(orderDate.getDate()).padStart(2, "0");
  const month = String(orderDate.getMonth() + 1).padStart(2, "0");
  const year = orderDate.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

  const formattedTime = orderDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Determine Payment Mode
  const isOnlinePaid =
    order.notes?.toLowerCase().includes("paid online") ||
    order.notes?.toLowerCase().includes("razorpay");
  const paymentModeText = isOnlinePaid ? "online" : "cash";

  // Format decimal amounts
  const formatAmt = (num: number) => `₹${Number(num || 0).toFixed(2)}`;

  const handlePrint = () => {
    setIsPrinting(true);

    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Receipt-${order.order_number}</title>
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
      padding: 4mm 3mm 8mm 3mm;
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
    .bill-no {
      font-size: 13px;
      font-weight: 800;
      margin-bottom: 2px;
      letter-spacing: 0.2px;
    }
    .store-name {
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.2px;
    }
    .store-phone {
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 3px;
    }
    .line-solid {
      border-bottom: 1px solid #000;
      margin: 4px 0;
    }
    .line-dashed {
      border-bottom: 1px dashed #000;
      margin: 5px 0;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      margin: 2px 0;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 2px 0;
    }
    .items-table th {
      font-size: 10.5px;
      font-weight: 700;
      padding: 3px 0;
      text-align: left;
    }
    .items-table th.qty, .items-table td.qty {
      text-align: center;
      width: 12%;
    }
    .items-table th.rate, .items-table td.rate {
      text-align: right;
      width: 25%;
      white-space: nowrap;
    }
    .items-table th.amt, .items-table td.amt {
      text-align: right;
      width: 25%;
      white-space: nowrap;
    }
    .items-table td {
      font-size: 10px;
      vertical-align: top;
      padding: 2.5px 0;
    }
    .item-name {
      font-weight: 600;
      line-height: 1.15;
    }
    .item-variant {
      font-size: 9px;
      color: #222;
      display: block;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      margin: 2.5px 0;
    }
    .grand-total {
      font-size: 13px;
      font-weight: 800;
      margin: 3px 0;
    }
    .customer-box {
      font-size: 9.5px;
      line-height: 1.3;
      margin: 4px 0;
    }
    .footer-note {
      text-align: center;
      font-size: 11.5px;
      font-weight: 600;
      margin-top: 6px;
    }
    .branding {
      text-align: center;
      font-size: 10px;
      margin-top: 5px;
      letter-spacing: 0.3px;
    }
  </style>
</head>
<body>
  <div class="center">
    <div class="bill-no">Bill No: ${order.order_number}</div>
    <div class="store-name">Green Basket Tcr</div>
    <div class="store-phone">PHONE: ${storePhone}</div>
  </div>

  <div class="line-solid"></div>

  <div class="meta-row">
    <span>Date: ${formattedDate}</span>
    <span>Time: ${formattedTime}</span>
  </div>
  <div class="meta-row">
    <span>Order Type: sale</span>
  </div>

  <div class="line-solid"></div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Item</th>
        <th class="qty">Qty</th>
        <th class="rate">Rate</th>
        <th class="amt">Amt</th>
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
          <td class="qty">${item.quantity}</td>
          <td class="rate">${formatAmt(item.unit_price)}</td>
          <td class="amt">${formatAmt(item.line_total)}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>

  <div class="line-solid"></div>

  <div class="total-row">
    <span>Sub Total</span>
    <span class="bold">${formatAmt(order.subtotal)}</span>
  </div>
  <div class="total-row">
    <span>Delivery Charge</span>
    <span>${formatAmt(order.delivery_fee)}</span>
  </div>

  <div class="line-solid"></div>

  <div class="total-row grand-total">
    <span>Grand Total</span>
    <span>${formatAmt(order.total)}</span>
  </div>
  <div class="total-row">
    <span>Payment Mode</span>
    <span class="bold" style="text-transform: lowercase;">${paymentModeText}</span>
  </div>

  ${
    includeAddress
      ? `
  <div class="line-solid"></div>
  <div class="customer-box">
    <div><strong>Customer:</strong> ${order.customer_name}</div>
    <div><strong>Phone:</strong> ${order.phone}</div>
    <div><strong>Address:</strong> ${order.address}, ${order.city} - ${order.pincode}</div>
    ${order.notes ? `<div><strong>Note:</strong> ${order.notes}</div>` : ""}
  </div>
  `
      : ""
  }

  <div class="line-dashed"></div>

  <div class="footer-note">Thank you. Visit Again!</div>
  <div class="branding">Powered by GINGR POS</div>
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
      className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-gray-100 max-h-[92vh] flex flex-col">
        {/* Header Actions */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gb-green">
              ATPOS 58mm Thermal Print
            </span>
            <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <Printer size={18} className="text-gb-green" />
              Bill #{order.order_number}
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

        {/* Options Toolbar */}
        <div className="py-2.5 px-3 bg-gray-50 rounded-xl border border-gray-100 my-3 flex items-center justify-between text-xs shrink-0">
          <label className="flex items-center gap-2 text-gray-700 cursor-pointer select-none font-medium">
            <input
              type="checkbox"
              checked={includeAddress}
              onChange={(e) => setIncludeAddress(e.target.checked)}
              className="w-4 h-4 rounded text-gb-green focus:ring-gb-green accent-[#245B35]"
            />
            <span>Include Customer & Delivery Address on Bill</span>
          </label>
          <span className="text-[10px] text-gray-400 font-mono">58mm Roll</span>
        </div>

        {/* Realistic Thermal Receipt Paper Scroll Preview */}
        <div className="flex-1 overflow-y-auto py-2 px-1 flex justify-center bg-gray-100/70 rounded-2xl border border-gray-200/80">
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
              <div className="font-extrabold text-[13px] tracking-tight">
                Bill No: {order.order_number}
              </div>
              <div className="font-black text-[14px] tracking-tight mt-0.5">
                Green Basket Tcr
              </div>
              <div className="font-bold text-[11px]">PHONE: {storePhone}</div>
            </div>

            {/* Solid Line */}
            <div className="border-b border-black my-1.5" />

            {/* Date & Time */}
            <div className="flex justify-between text-[10.5px]">
              <span>Date: {formattedDate}</span>
              <span>Time: {formattedTime}</span>
            </div>
            <div className="text-[10.5px] mt-0.5">Order Type: sale</div>

            {/* Solid Line */}
            <div className="border-b border-black my-1.5" />

            {/* Items Table */}
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="font-bold text-left border-b border-black">
                  <th className="pb-1 font-bold">Item</th>
                  <th className="pb-1 text-center w-[12%] font-bold">Qty</th>
                  <th className="pb-1 text-right w-[25%] font-bold">Rate</th>
                  <th className="pb-1 text-right w-[25%] font-bold">Amt</th>
                </tr>
              </thead>
              <tbody>
                {(order.order_items || []).map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="py-1 pr-1 font-medium leading-tight">
                      <div>{item.product_name_snapshot}</div>
                      {item.variant_label_snapshot && (
                        <div className="text-[9px] text-gray-700">
                          {item.variant_label_snapshot}
                        </div>
                      )}
                    </td>
                    <td className="py-1 text-center font-bold">{item.quantity}</td>
                    <td className="py-1 text-right font-mono">
                      {formatAmt(item.unit_price)}
                    </td>
                    <td className="py-1 text-right font-mono">
                      {formatAmt(item.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Solid Line */}
            <div className="border-b border-black my-1.5" />

            {/* Totals */}
            <div className="space-y-1 text-[10.5px]">
              <div className="flex justify-between">
                <span>Sub Total</span>
                <span className="font-bold font-mono">
                  {formatAmt(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-mono">
                  {formatAmt(order.delivery_fee)}
                </span>
              </div>
            </div>

            {/* Solid Line */}
            <div className="border-b border-black my-1.5" />

            {/* Grand Total & Payment Mode */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between font-black text-[12.5px]">
                <span>Grand Total</span>
                <span className="font-mono">{formatAmt(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode</span>
                <span className="font-bold lowercase">{paymentModeText}</span>
              </div>
            </div>

            {/* Customer Details Box (Optional) */}
            {includeAddress && (
              <>
                <div className="border-b border-black my-1.5" />
                <div className="text-[9.5px] leading-tight space-y-0.5 text-gray-900">
                  <div>
                    <strong className="font-bold">Customer:</strong>{" "}
                    {order.customer_name}
                  </div>
                  <div>
                    <strong className="font-bold">Phone:</strong> {order.phone}
                  </div>
                  <div>
                    <strong className="font-bold">Address:</strong>{" "}
                    {order.address}, {order.city} - {order.pincode}
                  </div>
                  {order.notes && (
                    <div>
                      <strong className="font-bold">Note:</strong> {order.notes}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Dashed Line */}
            <div className="border-b border-dashed border-black my-2" />

            {/* Footer */}
            <div className="text-center space-y-1 pt-0.5">
              <div className="font-bold text-[11px]">Thank you. Visit Again!</div>
              <div className="text-[9.5px] tracking-wider text-gray-800">
                Powered by GINGR POS
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-gray-500">
            Works with any 58mm / 80mm USB & Bluetooth thermal printer.
          </p>
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="btn-primary text-xs py-2 px-5 shadow-xs flex items-center gap-2"
          >
            <Printer size={15} />
            <span>{isPrinting ? "Printing..." : "Print Bill (58mm)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
