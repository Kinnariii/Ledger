import { NextResponse } from "next/server";
import { generatePKCE, storeVerifier } from "@/lib/auth/pkce";

export async function GET() {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const app_url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!client_id) {
    console.error("GOOGLE_CLIENT_ID environment variable is missing.");
    return NextResponse.json(
      { error: "OAuth misconfigured: client_id missing" },
      { status: 500 }
    );
  }

  const { verifier, challenge } = await generatePKCE();

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", client_id);
  googleAuthUrl.searchParams.set("redirect_uri", `${app_url}/api/auth/callback`);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("code_challenge", challenge);
  googleAuthUrl.searchParams.set("code_challenge_method", "S256");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "consent"); // Ensure consent screen is shown to guarantee refresh token

  const response = NextResponse.redirect(googleAuthUrl.toString());
  storeVerifier(response, verifier);

  return response;
}
