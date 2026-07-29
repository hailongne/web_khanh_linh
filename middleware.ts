import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Redirect legacy blog login to /login
  if (pathname === "/admin/blog/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Minimalist Auth Check for /admin routes
  if (pathname.startsWith("/admin")) {
    const hasSessionCookie = request.cookies.has("admin_session");

    if (!hasSessionCookie) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin"]
};
