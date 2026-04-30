import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || "pos-merch-super-secret-key";
const key = new TextEncoder().encode(secretKey);

// Public routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/api/auth/login", "/api/auth/register"];

// Routes restricted to MANAGER or SUPERADMIN only
const managerRoutes = ["/dashboard", "/products", "/categories"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and static assets
  if (
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;

  // No token → redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });

    const role = payload.role as string;

    // Check RBAC for manager-only routes
    if (managerRoutes.some((route) => pathname.startsWith(route))) {
      if (role === "CASHIER") {
        // Cashier trying to access manager routes → redirect to POS
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Inject user info into request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId as string);
    requestHeaders.set("x-user-role", role);
    requestHeaders.set("x-user-email", payload.email as string);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch {
    // Invalid or expired token → redirect to login
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set("auth_token", "", {
      expires: new Date(0),
      path: "/",
    });
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
