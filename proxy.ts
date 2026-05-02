import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getToken } from "next-auth/jwt";

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

  // 2. Allow auth APIs (including NextAuth callbacks) and static assets
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 3. Try NextAuth JWT token first
  let role: string | null = null;
  let userId: string | null = null;
  let email: string | null = null;

  try {
    const nextAuthToken = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (nextAuthToken) {
      role = (nextAuthToken.role as string) || null;
      userId = (nextAuthToken.userId as string) || null;
      email = (nextAuthToken.email as string) || null;
    }
  } catch {
    // NextAuth token not available
  }

  // 4. Fallback to legacy JWT cookie
  if (!role) {
    const legacyToken = request.cookies.get("auth_token")?.value;
    if (legacyToken) {
      try {
        const { payload } = await jwtVerify(legacyToken, key, {
          algorithms: ["HS256"],
        });
        role = payload.role as string;
        userId = payload.userId as string;
        email = payload.email as string;
      } catch {
        // Invalid legacy token
      }
    }
  }

  // 5. No valid session → redirect to login
  if (!role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    // Clear stale legacy cookie
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set("auth_token", "", {
      expires: new Date(0),
      path: "/",
    });
    return response;
  }

  // 6. Check RBAC for manager-only routes
  if (managerRoutes.some((route) => pathname.startsWith(route))) {
    if (role === "CASHIER") {
      // Cashier trying to access manager routes → redirect to POS (root)
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 7. Inject user info into request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  if (userId) requestHeaders.set("x-user-id", userId);
  if (role) requestHeaders.set("x-user-role", role);
  if (email) requestHeaders.set("x-user-email", email);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/", "/profile/:path*", "/dashboard/:path*", "/products/:path*", "/categories/:path*", "/customers/:path*", "/suppliers/:path*", "/history/:path*"],
};
