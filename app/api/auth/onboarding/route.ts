import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const onboardingSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Business type is required"),
  industry: z.string().optional(),
  teamSize: z.string().min(1, "Team size is required"),
  goals: z.array(z.string()).min(1, "Select at least one goal"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = onboardingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { businessName, businessType, industry, teamSize, goals } = result.data;

    // Update Tenant name, businessType, and onboardingData JSON
    await prisma.tenant.update({
      where: { id: session.tenantId },
      data: {
        name: businessName,
        businessType: businessType,
        onboardingData: {
          industry: industry || "",
          teamSize,
          goals,
        },
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        tenantId: session.tenantId,
        actorType: "USER",
        actorId: session.userId,
        action: "tenant.onboarding_complete",
        entityType: "Tenant",
        entityId: session.tenantId,
        metadata: { businessName, businessType, industry, teamSize, goals },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in onboarding API:", error);
    return NextResponse.json(
      { error: "Internal server error during onboarding" },
      { status: 500 }
    );
  }
}
