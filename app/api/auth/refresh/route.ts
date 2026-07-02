import { NextRequest, NextResponse } from "next/server";
import { hashToken, generateRefreshToken, signAccessToken } from "@/lib/auth/jwt";
import { setSessionCookies, clearSessionCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "Missing refresh token" }, { status: 401 });
  }

  try {
    const hashed = await hashToken(refreshToken);

    // Find the token in the database
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashed },
      include: {
        user: true,
      },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    const app_url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // ─── REUSE DETECTION ───
    if (tokenRecord.revoked) {
      console.warn(
        `[AUTH WARNING] Revoked refresh token reuse detected for user ${tokenRecord.userId}. Revoking token family.`
      );

      // Revoke all refresh tokens for this user as a security measure
      await prisma.refreshToken.updateMany({
        where: { userId: tokenRecord.userId },
        data: { revoked: true },
      });

      // Log system audit log for token reuse
      await prisma.auditLog.create({
        data: {
          tenantId: tokenRecord.user.tenantId,
          actorType: "SYSTEM",
          action: "auth.token_reuse_detected",
          entityType: "RefreshToken",
          entityId: tokenRecord.id,
          metadata: {
            userId: tokenRecord.userId,
            ipAddress: request.headers.get("x-forwarded-for") || null,
            userAgent: request.headers.get("user-agent") || null,
          },
        },
      });

      const response = NextResponse.json(
        { error: "Compromised session. All tokens revoked." },
        { status: 401 }
      );
      clearSessionCookies(response);
      return response;
    }

    // ─── EXPIRATION CHECK ───
    if (new Date() > tokenRecord.expiresAt) {
      const response = NextResponse.json({ error: "Refresh token expired" }, { status: 401 });
      clearSessionCookies(response);
      return response;
    }

    // ─── ROTATION ───
    const newRawRefreshToken = generateRefreshToken();
    const newHashedRefreshToken = await hashToken(newRawRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Perform database rotation atomically
    const response = await prisma.$transaction(async (tx) => {
      // 1. Create new refresh token
      const newToken = await tx.refreshToken.create({
        data: {
          userId: tokenRecord.userId,
          tokenHash: newHashedRefreshToken,
          expiresAt,
          ipAddress: request.headers.get("x-forwarded-for") || null,
          userAgent: request.headers.get("user-agent") || null,
        },
      });

      // 2. Mark old token revoked and link to new token
      await tx.refreshToken.update({
        where: { id: tokenRecord.id },
        data: {
          revoked: true,
          replacedByTokenId: newToken.id,
        },
      });

      // 3. Sign new JWT Access Token
      const accessToken = await signAccessToken({
        userId: tokenRecord.user.id,
        tenantId: tokenRecord.user.tenantId,
        role: tokenRecord.user.role,
      });

      const redirectResponse = NextResponse.json({ success: true });
      setSessionCookies(redirectResponse, accessToken, newRawRefreshToken);

      return redirectResponse;
    });

    return response;
  } catch (error) {
    console.error("Error in token refresh:", error);
    return NextResponse.json(
      { error: "Internal server error during token refresh" },
      { status: 500 }
    );
  }
}
