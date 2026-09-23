import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  // Skip middleware for admin login and non-admin routes
  if (!isAdminRoute || isLoginPage) {
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store, must-revalidate");
    return res;
  }

  // Check for session cookie (iron-session cookie name)
  const sessionCookie = request.cookies.get("a2z-session");

  if (!sessionCookie) {
    const res = NextResponse.redirect(new URL("/admin/login", request.url));
    res.headers.set("Cache-Control", "no-store, must-revalidate");
    return res;
  }

  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store, must-revalidate");
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
