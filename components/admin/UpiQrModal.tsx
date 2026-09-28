"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  QrCode,
  Download,
  Copy,
  Check,
  Share2,
  ExternalLink,
  MessageCircle,
  CreditCard,
  Building2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { generateUpiQrCodeDataUrl, buildUpiUri } from "@/lib/upi";

interface UpiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  amount: number;
  customerName?: string;
  customerPhone?: string;
  upiId?: string;
  payeeName?: string;
}

export function UpiQrModal({
  isOpen,
  onClose,
  orderNumber,
  amount,
  customerName = "Customer",
  customerPhone = "",
  upiId = "greenbasket@upi",
  payeeName = "Green Basket TCR",
}: UpiQrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const cleanUpi = upiId.trim() || "greenbasket@upi";
  const cleanPayee = payeeName.trim() || "Green Basket TCR";
  const upiUri = buildUpiUri({
    upiId: cleanUpi,
    payeeName: cleanPayee,
    amount,
    orderNumber,
  });

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    generateUpiQrCodeDataUrl({
      upiId: cleanUpi,
      payeeName: cleanPayee,
      amount,
      orderNumber,
    }, 380).then((url) => {
      if (active) setQrDataUrl(url);
    });

    return () => {
      active = false;
    };
  }, [isOpen, cleanUpi, cleanPayee, amount, orderNumber]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(cleanUpi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(upiUri);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `UPI-QR-${orderNumber}-${amount}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const cleanPhone = customerPhone.replace(/\D/g, "");
  const whatsappShareText =
    `🌿 *Green Basket TCR — UPI Payment Request* 🌿\n\n` +
    `Hello *${customerName}*,\n` +
    `Please complete your payment for Order *#${orderNumber}*:\n\n` +
    `💰 *Amount Due:* ${formatPrice(amount)}\n` +
    `📌 *Store UPI ID:* \`${cleanUpi}\`\n` +
    `👤 *Payee:* ${cleanPayee}\n\n` +
    `👉 *Tap to Pay directly on GPay / PhonePe / Paytm:*\n` +
    `${upiUri}\n\n` +
    `_After paying, please share a quick screenshot here. Thank you!_ 🌱`;

  const whatsappShareUrl = cleanPhone
    ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(whatsappShareText)}`
    : `https://wa.me/?text=${encodeURIComponent(whatsappShareText)}`;

  return (
    <div className="fixed inset-0 z-[450] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-gb-green flex items-center justify-center">
              <QrCode size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">UPI Payment QR</h3>
              <p className="text-[11px] text-gray-500 font-mono">Order {orderNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Amount & Payee Badge */}
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 text-center">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800">
            Amount Locked in QR
          </span>
          <p className="text-2xl font-black text-gb-green font-mono mt-0.5">
            {formatPrice(amount)}
          </p>
          <p className="text-[11px] text-gray-600 font-medium mt-0.5">
            Payee: <strong className="text-gray-800">{cleanPayee}</strong>
          </p>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-2xl shadow-inner">
          {qrDataUrl ? (
            <div className="relative w-56 h-56 flex items-center justify-center">
              <Image
                src={qrDataUrl}
                alt={`UPI QR for ${orderNumber}`}
                width={224}
                height={224}
                className="rounded-lg"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-gray-400 text-xs font-medium">
              Generating dynamic QR code...
            </div>
          )}
          <span className="text-[10px] text-gray-400 mt-2 font-medium">
            Scan with GPay / PhonePe / Paytm / BHIM
          </span>
        </div>

        {/* UPI ID Row */}
        <div className="bg-gray-50 rounded-xl p-2.5 flex items-center justify-between border border-gray-200/80 text-xs">
          <div className="truncate pr-2">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">UPI ID</span>
            <code className="font-mono font-bold text-gray-900 text-xs select-all">
              {cleanUpi}
            </code>
          </div>
          <button
            type="button"
            onClick={handleCopyUpi}
            className="px-2.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 font-bold rounded-lg border border-gray-200 transition-colors flex items-center gap-1 shrink-0 text-xs"
          >
            {copiedUpi ? (
              <>
                <Check size={13} className="text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Actions: Download QR & WhatsApp Share */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownloadQr}
              className="py-2.5 px-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download size={14} />
              <span>Download QR</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span className="text-emerald-700">Link Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy UPI Link</span>
                </>
              )}
            </button>
          </div>

          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]"
          >
            <MessageCircle size={15} />
            <span>Send Payment Request on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
