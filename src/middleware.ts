import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL("/dang-nhap", request.url));
    }

    try {
      // Decode JWT to check role (simple base64 decode, no verification needed in middleware)
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );

      if (payload.role !== "ROLE_ADMIN") {
        // Redirect to home if not admin
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL("/dang-nhap", request.url));
    }
  }

  // Redirect authenticated users away from login page
  if (pathname === "/dang-nhap" && token) {
    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );

      // Redirect admin to admin panel, others to home
      if (payload.role === "ROLE_ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    } catch (error) {
      // Invalid token, allow access to login
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};

