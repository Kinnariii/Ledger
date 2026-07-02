import { NextRequest, NextResponse } from "next/server";

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function generatePKCE() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const verifier = base64UrlEncode(array);

  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const challenge = base64UrlEncode(new Uint8Array(hashBuffer));

  return { verifier, challenge };
}

export function storeVerifier(response: NextResponse, verifier: string) {
  response.cookies.set("oauth_verifier", verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 300, // 5 minutes
  });
}

export function getVerifier(request: NextRequest): string | undefined {
  return request.cookies.get("oauth_verifier")?.value;
}

export function clearVerifier(response: NextResponse) {
  response.cookies.delete("oauth_verifier");
}
