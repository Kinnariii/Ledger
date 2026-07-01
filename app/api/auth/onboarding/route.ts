import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Onboarding data received:", data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in onboarding API:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
