import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { COMING_SOON_MODE } from "@/config/launch";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If Coming Soon mode is active, rewrite all public pages to /coming-soon
  if (COMING_SOON_MODE) {
    const isExcluded =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname === "/coming-soon" ||
      pathname === "/robots.txt" ||
      pathname === "/sitemap.xml" ||
      pathname === "/sw.js" ||
      pathname === "/manifest.webmanifest" ||
      Boolean(pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|js|json|webmanifest)$/));

    const hasPreview =
      request.cookies.get("gb_preview")?.value === "true" ||
      request.nextUrl.searchParams.get("preview") === "admin";

    if (!isExcluded && !hasPreview) {
      const url = request.nextUrl.clone();
      url.pathname = "/coming-soon";
      return NextResponse.rewrite(url);
    }
  } else {
    // If coming soon is turned off, redirect /coming-soon back to home
    if (pathname === "/coming-soon") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
