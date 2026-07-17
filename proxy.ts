import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Admin-only routes — Authors will get a 403
const ADMIN_ONLY_PATHS = [
  "/admin/categories",
  "/admin/forms",
  "/admin/menus",
  "/admin/globals",
  "/admin/users",
];

export default auth(function proxy(req: NextRequest & { auth: import("next-auth").Session | null }) {
  const { pathname } = req.nextUrl;

  // Not an admin route — let it through
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Exact /admin route should go to dashboard
  if (pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // No session — redirect to login
  if (!req.auth && pathname !== "/admin/login") {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already authenticated, trying to access login — redirect to dashboard
  if (req.auth && pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  const role = (req.auth?.user as { role?: string })?.role;

  // Author trying to access admin-only route
  const isAdminOnly = ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p));
  if (isAdminOnly && role !== "admin") {
    return new NextResponse(
      JSON.stringify({ error: "Forbidden: Admin access required." }),
      { status: 403, headers: { "content-type": "application/json" } }
    );
  }

  return NextResponse.next();
});

export const config = {
  // Run on all admin routes; skip static files and Next.js internals
  matcher: ["/admin/:path*"],
};
