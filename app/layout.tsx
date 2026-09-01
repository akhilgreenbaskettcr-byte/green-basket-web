import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartSlideOver } from "@/components/cart/CartSlideOver";
import { CartToast } from "@/components/cart/CartToast";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#245B35",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Green Basket TCR — Your Kitchen, Simplified",
    template: "%s | Green Basket TCR",
  },
  description:
    "From freshly cut vegetables to stone-ground powders and cold-pressed oils — everything your kitchen needs, made easy. Fresh Kerala groceries delivered to your doorstep in Thrissur.",
  keywords: [
    "fresh vegetables Kerala",
    "cut vegetables delivery Thrissur",
    "curry powders",
    "masala powders",
    "Kerala spices",
    "fresh groceries Thrissur",
    "Green Basket TCR",
    "coconut oil Kerala",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Green Basket",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Green Basket TCR",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Green Basket TCR",
      },
    ],
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
        <PwaRegister />
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
