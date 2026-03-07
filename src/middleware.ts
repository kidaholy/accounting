import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { hasRole } from "./lib/auth";

export default auth((req: NextRequest & { auth: { user?: { role?: string; tenantId?: string } } | null }) => {
  const session = req.auth;
  const path = req.nextUrl.pathname;

  // Redirect to login if not authenticated
  if (!session && path !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect logged-in users away from login page
  if (session && path === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const userRole = session?.user?.role;

  // Super admin routes
  if (path.startsWith("/admin/super") && !hasRole(userRole || "", "super_admin")) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // Tenant admin routes
  if (path.startsWith("/admin/tenant") && !hasRole(userRole || "", "tenant_admin")) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // Viewer restrictions on API routes
  if (path.startsWith("/api/") && userRole === "viewer" && req.method !== "GET") {
    return NextResponse.json({ error: "Read-only access" }, { status: 403 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/api/assets/:path*",
    "/api/inventory/:path*",
    "/api/vat/:path*",
    "/api/tenants/:path*",
    "/api/users/:path*",
  ],
};
