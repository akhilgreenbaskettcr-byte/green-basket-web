import QRCode from "qrcode";

export interface UpiPaymentParams {
  upiId: string;
  payeeName: string;
  amount: number;
  orderNumber: string;
  note?: string;
}

/**
 * Builds the standard NPCI compliant UPI deep-link URI
 * upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=INR&tn=NOTE
 */
export function buildUpiUri({
  upiId,
  payeeName,
  amount,
  orderNumber,
  note,
}: UpiPaymentParams): string {
  const cleanUpi = upiId.trim();
  const cleanName = encodeURIComponent(payeeName.trim() || "Green Basket TCR");
  const formattedAmount = Number(amount).toFixed(2);
  const transactionNote = encodeURIComponent(
    (note ? `${note} ` : "") + `Order ${orderNumber}`.trim()
  );

  return `upi://pay?pa=${cleanUpi}&pn=${cleanName}&am=${formattedAmount}&cu=INR&tn=${transactionNote}`;
}

/**
 * Generates a high-quality base64 Data URL for rendering the UPI QR code
 */
export async function generateUpiQrCodeDataUrl(
  params: UpiPaymentParams,
  width: number = 320
): Promise<string> {
  const upiUri = buildUpiUri(params);
  try {
    return await QRCode.toDataURL(upiUri, {
      width,
      margin: 2,
      color: {
        dark: "#143D2B", // Green Basket Dark Green
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });
  } catch (error) {
    console.error("Failed to generate UPI QR code Data URL:", error);
    return "";
  }
}
