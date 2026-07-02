import { NextRequest, NextResponse } from "next/server";
import { getVerifier, clearVerifier } from "@/lib/auth/pkce";
import { signAccessToken, generateRefreshToken, hashToken } from "@/lib/auth/jwt";
import { setSessionCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { UserRole } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const app_url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error) {
    console.error("Google OAuth error parameter:", error);
    return NextResponse.json({ error: `OAuth failed: ${error}` }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  const verifier = getVerifier(request);
  if (!verifier) {
    return NextResponse.json(
      { error: "Missing PKCE verifier cookie. Flow may have expired or was hijacked." },
      { status: 400 }
    );
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${app_url}/api/auth/callback`,
        grant_type: "authorization_code",
        code_verifier: verifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return NextResponse.json({ error: "Failed to exchange authorization code" }, { status: 400 });
    }

    const tokens = await tokenResponse.json();

    // 2. Fetch Google profile info
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!profileResponse.ok) {
      console.error("Failed to fetch Google profile info");
      return NextResponse.json({ error: "Failed to retrieve user profile" }, { status: 400 });
    }

    const profile = await profileResponse.json();
    const googleId = profile.sub;
    const email = profile.email;
    const name = profile.name;
    const avatarUrl = profile.picture || null;

    if (!googleId || !email) {
      return NextResponse.json({ error: "Invalid user profile returned from provider" }, { status: 400 });
    }

    // 3. Find or create user and tenant
    let user = await prisma.user.findUnique({
      where: { googleId },
      include: { tenant: true },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // Check if there is an existing tenant with the same email domain, or just create a new one
      const tenant = await prisma.tenant.create({
        data: {
          name: `${name}'s Business`,
        },
      });

      user = await prisma.user.create({
        data: {
          googleId,
          email,
          name,
          avatarUrl,
          role: UserRole.OWNER,
          tenantId: tenant.id,
        },
        include: { tenant: true },
      });

      // Write System audit log for tenant creation
      await prisma.auditLog.create({
        data: {
          tenantId: tenant.id,
          actorType: "SYSTEM",
          action: "tenant.create",
          entityType: "Tenant",
          entityId: tenant.id,
          metadata: { creator: email, source: "oauth_callback" },
        },
      });
    }

    // 4. Generate application session tokens
    const accessToken = await signAccessToken({
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
    });

    const rawRefreshToken = generateRefreshToken();
    const refreshTokenHash = await hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Store hashed refresh token in database
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt,
      },
    });

    // 5. Prepare Redirect Response and set cookies
    const redirectUrl = new URL(isNewUser ? "/onboarding" : "/dashboard", app_url);
    const response = NextResponse.redirect(redirectUrl.toString());

    // Clear PKCE verifier
    clearVerifier(response);

    // Set secure authentication session cookies
    setSessionCookies(response, accessToken, rawRefreshToken);

    return response;
  } catch (err) {
    console.error("Error in OAuth callback:", err);
    return NextResponse.json({ error: "Internal server error during authentication" }, { status: 500 });
  }
}
