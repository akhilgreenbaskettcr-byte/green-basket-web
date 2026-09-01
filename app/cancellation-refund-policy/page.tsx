import type { Metadata } from "next";
import RefundPolicyPage from "@/app/refund-policy/page";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy — Green Basket TCR",
  description:
    "Learn about our 100% freshness guarantee, cancellation window, and 5-7 day Razorpay refund process for fresh groceries.",
};

export default function Page() {
  return <RefundPolicyPage />;
}
