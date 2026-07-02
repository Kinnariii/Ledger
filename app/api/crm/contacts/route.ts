import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  source: z.string().default("MANUAL"),
  tags: z.array(z.string()).default([]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, phone, source, tags } = result.data;

    // Create the contact in the database
    const contact = await prisma.contact.create({
      data: {
        tenantId: session.tenantId,
        name,
        email: email || null,
        phone: phone || null,
        source: source.toUpperCase(),
        tags: tags || [],
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        tenantId: session.tenantId,
        actorType: "USER",
        actorId: session.userId,
        action: "contact.create",
        entityType: "Contact",
        entityId: contact.id,
        metadata: { name, email, phone, source, tags },
      },
    });

    return NextResponse.json({ success: true, contact });
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "Internal server error during contact creation" },
      { status: 500 }
    );
  }
}
