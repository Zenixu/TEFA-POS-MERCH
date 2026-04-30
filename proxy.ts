import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || "pos-merch-super-secret-key";
const key = new TextEncoder().encode(secretKey);

// Public pages that don't require authentication
const publicPages = ["/login", "/register"];

// Routes restricted to MANAGER or SUPERADMIN only
const managerRoutes = ["/dashboard", "/products", "/categories"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public pages exactly
  if (publicPages.includes(pathname)) {
    return NextResponse.next();
  }

  // 2. Allow auth APIs and static assets
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;

  // 3. No token → redirect to login
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

    // 4. Check RBAC for manager-only routes
    if (managerRoutes.some((route) => pathname.startsWith(route))) {
      if (role === "CASHIER") {
        // Cashier trying to access manager routes → redirect to POS (root)
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // 5. Inject user info into request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId as string);
    requestHeaders.set("x-user-role", role);
    requestHeaders.set("x-user-email", payload.email as string);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (error) {
    // Invalid or expired token → clear cookie and redirect to login
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
  matcher: ["/", "/dashboard/:path*", "/products/:path*", "/categories/:path*", "/customers/:path*", "/suppliers/:path*", "/history/:path*"],
};
