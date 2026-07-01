import { NextResponse } from "next/server";

export async function GET() {
  // In development, redirect straight to onboarding to simulate OAuth completion
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.redirect(new URL("/onboarding", baseUrl));
}
