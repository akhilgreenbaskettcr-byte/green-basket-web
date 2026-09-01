import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Green Basket TCR — Fresh Groceries & Vegetables",
    short_name: "Green Basket",
    description:
      "Order fresh cold-cut vegetables, stone-ground powders, and cold-pressed oils in Thrissur, Kerala.",
    start_url: "/",
    id: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#245B35",
    orientation: "portrait",
    scope: "/",
    categories: ["shopping", "food", "lifestyle"],
    lang: "en",
    dir: "ltr",
    prefer_related_applications: false,
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Shop Fresh Groceries",
        short_name: "Shop",
        description: "Browse all fresh vegetables, powders and oils",
        url: "/categories",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "My Orders",
        short_name: "Orders",
        description: "Track your active orders",
        url: "/account",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Contact Support",
        short_name: "Support",
        description: "Get in touch with Green Basket TCR",
        url: "/contact",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}
