import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  // Skip middleware for admin login
  if (!isAdminRoute || isLoginPage) {
    return NextResponse.next();
  }

  // Check for session cookie (iron-session cookie name)
  const sessionCookie = request.cookies.get("a2z-session");

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Note: Actual admin verification happens in API routes / pages
  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
