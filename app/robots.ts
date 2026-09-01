import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL;
  const BASE_URL =
    rawUrl && !rawUrl.includes("localhost")
      ? rawUrl.replace(/\/$/, "")
      : "https://www.greenbaskettcr.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/images/", "/icons/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
