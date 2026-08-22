import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartSlideOver } from "@/components/cart/CartSlideOver";
import { CartToast } from "@/components/cart/CartToast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Green Basket — Your Kitchen, Simplified",
    template: "%s | Green Basket",
  },
  description:
    "From freshly cut vegetables to aromatic powders and pure oils — everything your kitchen needs, made easy. Fresh Kerala groceries delivered to your doorstep.",
  keywords: [
    "fresh vegetables Kerala",
    "cut vegetables delivery",
    "curry powders",
    "masala powders",
    "Kerala spices",
    "fresh groceries",
    "Green Basket",
    "coconut oil Kerala",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Green Basket",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        <CartSlideOver />
        <CartToast />
      </body>
    </html>
  );
}
