import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ntrzjndirogtbpzugxmu.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_siaC0gN3kNgDNgi6kYWekg_1Sxd8TQa";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Server-side auth verification with getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /admin/* routes
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isAdminLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isAdminLoginRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = (profile as { role: string } | null)?.role;

    if (role !== "admin" && role !== "staff") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    // If role is staff, restrict admin-only pages (dashboard, settings, staff, customers, home-editor)
    if (role === "staff") {
      const pathname = request.nextUrl.pathname;
      const isAdminOnlyPath =
        pathname === "/admin" ||
        pathname === "/admin/" ||
        pathname.startsWith("/admin/products") ||
        pathname.startsWith("/admin/settings") ||
        pathname.startsWith("/admin/staff") ||
        pathname.startsWith("/admin/customers") ||
        pathname.startsWith("/admin/home-editor");

      if (isAdminOnlyPath) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/orders";
        return NextResponse.redirect(url);
      }
    }
  }

  // If logged in as admin or staff and trying to access admin login, redirect
  if (isAdminLoginRoute && user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = (profile as { role: string } | null)?.role;
    if (role === "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    if (role === "staff") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/orders";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
