import type { Metadata } from "next";
import TermsPage from "@/app/terms-and-conditions/page";

export const metadata: Metadata = {
  title: "Terms of Service — Green Basket TCR",
  description:
    "Review the terms and conditions for ordering fresh vegetables, powders, and oils from Green Basket TCR.",
};

export default function Page() {
  return <TermsPage />;
}
