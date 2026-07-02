import { headers, cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAccessToken, TokenPayload } from "./jwt";

export interface Session {
  userId: string;
  tenantId: string;
  role: string;
}

export async function getSession(): Promise<Session | null> {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");
  const tenantId = headersList.get("x-tenant-id");
  const role = headersList.get("x-user-role");

  if (userId && tenantId && role) {
    return { userId, tenantId, role };
  }

  // Fallback to checking cookie directly (e.g. if request bypassed middleware)
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (token) {
    const payload = await verifyAccessToken(token);
    if (payload) {
      return {
        userId: payload.userId,
        tenantId: payload.tenantId,
        role: payload.role,
      };
    }
  }

  return null;
}

export function setSessionCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  response.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
  });

  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
}
