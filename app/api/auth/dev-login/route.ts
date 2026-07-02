import { NextRequest, NextResponse } from "next/server";
import { signAccessToken, generateRefreshToken, hashToken } from "@/lib/auth/jwt";
import { setSessionCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  // Only allow dev login in development environment
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden in production" }, { status: 403 });
  }

  const app_url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    // Fetch the seeded user
    const user = await prisma.user.findFirst({
      where: { email: "kinnari@acmedigital.com" },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Seeded user not found. Did you run the database seed?" },
        { status: 404 }
      );
    }

    // Generate tokens
    const accessToken = await signAccessToken({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
    });

    const rawRefreshToken = generateRefreshToken();
    const hashed = await hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashed,
        expiresAt,
      },
    });

    // Set cookies and redirect
    const response = NextResponse.redirect(new URL("/dashboard", app_url).toString());
    setSessionCookies(response, accessToken, rawRefreshToken);

    console.log(`[DEV LOGIN] Logged in as ${user.email} (Tenant: ${user.tenantId})`);
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
