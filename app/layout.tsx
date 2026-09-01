import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartSlideOver } from "@/components/cart/CartSlideOver";
import { CartToast } from "@/components/cart/CartToast";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import { BrandPreIntro } from "@/components/layout/BrandPreIntro";
import { JsonLd } from "@/components/seo/JsonLd";
import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";

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

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://greenbaskettcr.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Green Basket TCR — Fresh Cut Vegetables & Kerala Groceries Online Thrissur",
    template: "%s | Green Basket TCR Thrissur",
  },
  description:
    "Buy fresh hygienically cut vegetables, authentic Kerala homemade curry powders, stone-ground masalas & 100% pure cold-pressed coconut oil online in Thrissur. Order before 1:00 PM for next-day doorstep delivery across Ayyanthole, Poonkunnam, Ollur, Kakkanad & Thrissur district.",
  applicationName: "Green Basket TCR",
  authors: [{ name: "Green Basket TCR", url: "https://greenbaskettcr.com" }],
  generator: "Next.js",
  keywords: [
    // Hyper-Local Thrissur Keywords (High Intent)
    "online cut vegetables delivery Thrissur",
    "fresh cut vegetables Thrissur",
    "ready to cook vegetables Thrissur",
    "sambar cut vegetables Thrissur",
    "avial cut vegetables online Thrissur",
    "grocery delivery Ayyanthole 680003",
    "vegetable home delivery Poonkunnam",
    "fresh organic vegetables Ollur",
    "grocery store near Ayyanthole Ground Thrissur",
    "best online grocery Thrissur Kerala",
    "next day grocery delivery Thrissur",
    "Green Basket TCR Thrissur",
    
    // Kerala State-Wide High-Volume Keywords
    "Kerala traditional curry powders online",
    "pure cold pressed coconut oil Kerala",
    "nadan sambar powder Thrissur",
    "garlic pickle chutney powder Kerala",
    "roasted curry powders Kerala",
    "authentic Kerala spices online delivery",
    "freshly cut vegetables delivery Kerala",
    "vacuum packed vegetables Kerala",
    "chemical free coconut oil Kerala",

    // India-Wide National Keywords
    "authentic Kerala groceries delivery India",
    "order traditional Kerala spices online",
    "buy pure wood pressed oils India",
    "ready to cook Indian vegetables online",
    "Green Basket Kerala grocery store"
  ],
  alternates: {
    canonical: "/",
  },
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
    title: "Green Basket TCR",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "Green Basket TCR",
    title: "Green Basket TCR — Fresh Cut Vegetables & Kerala Groceries Online Thrissur",
    description:
      "Order freshly cut vegetables, aromatic homemade masala powders & pure cold-pressed coconut oil delivered to your doorstep in Thrissur, Kerala.",
    images: [
      {
        url: "/images/delivery-banner.png",
        width: 1200,
        height: 630,
        alt: "Green Basket TCR - Fresh Groceries Delivered in Thrissur",
      },
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Green Basket TCR Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Green Basket TCR — Fresh Cut Vegetables & Kerala Groceries Thrissur",
    description:
      "Fresh ready-to-cook vegetables, authentic stone-ground curry powders, and pure cold-pressed oils. Doorstep delivery in Thrissur, Kerala.",
    images: ["/images/delivery-banner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "IN-KL",
    "geo.placename": "Thrissur",
    "geo.position": "10.5276;76.2144",
    "ICBM": "10.5276, 76.2144",
    "format-detection": "telephone=no",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <JsonLd />
        <GoogleAnalytics />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <BrandPreIntro />
        {children}
        <CartSlideOver />
        <CartToast />
        <PwaRegister />
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
