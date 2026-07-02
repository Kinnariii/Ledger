import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-at-least-32-chars-long-please"
);

export async function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // Protect all dashboard, crm, inbox, chat, and workflows routes
  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/crm") ||
    pathname.startsWith("/inbox") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/workflows");

  if (!isDashboardRoute) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;

  // 1. Validate the Access Token
  if (accessToken) {
    try {
      const { payload } = await jwtVerify(accessToken, JWT_SECRET);

      // Inject session values into request headers for downstream Server Components & APIs
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-tenant-id", payload.tenantId as string);
      requestHeaders.set("x-user-id", payload.userId as string);
      requestHeaders.set("x-user-role", payload.role as string);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (err) {
      // Access token validation failed (expired or invalid). Fall through to refresh flow.
      console.log("Access token invalid or expired. Triggering refresh flow.");
    }
  }

  // 2. Refresh flow if Access Token is missing or expired
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    const loginUrl = new URL("/login", origin);
    return NextResponse.redirect(loginUrl.toString());
  }

  try {
    // Perform internal refresh request to get new session tokens
    const refreshUrl = new URL("/api/auth/refresh", origin);
    const refreshResponse = await fetch(refreshUrl.toString(), {
      method: "POST",
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    if (!refreshResponse.ok) {
      // Refresh failed (token family revoked or expired). Clear cookies and send to login.
      console.warn("Token refresh failed. Redirecting to login.");
      const loginUrl = new URL("/login", origin);
      const response = NextResponse.redirect(loginUrl.toString());
      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      return response;
    }

    // Success! Parse the updated cookies from the refresh response
    const setCookieHeaders = refreshResponse.headers.getSetCookie();
    
    // Redirect the user back to the same page they requested, setting the new cookies.
    // In the next request cycle, the valid access_token will be present.
    const redirectResponse = NextResponse.redirect(request.url);
    
    for (const cookieStr of setCookieHeaders) {
      redirectResponse.headers.append("Set-Cookie", cookieStr);
    }

    return redirectResponse;
  } catch (err) {
    console.error("Proxy refresh request error:", err);
    const loginUrl = new URL("/login", origin);
    return NextResponse.redirect(loginUrl.toString());
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth/callback, api/auth/login, api/auth/refresh (auth controllers)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth/callback|api/auth/login|api/auth/refresh|_next/static|_next/image|favicon.ico).*)",
  ],
};
