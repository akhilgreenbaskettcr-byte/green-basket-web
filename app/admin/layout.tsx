import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin — Green Basket", template: "%s | Admin — Green Basket" },
  robots: { index: false, follow: false },
};

export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
