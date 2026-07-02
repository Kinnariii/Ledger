import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { runLeadQualificationWorkflow } from "@/lib/workflows/leadQualification";
import { z } from "zod";

// Webhook validation secrets
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "ledger_verify_token_default";

// Zod schema for incoming Meta WhatsApp API webhook messages
const incomingMessageSchema = z.object({
  object: z.string(),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          value: z.object({
            messaging_product: z.string(),
            metadata: z.object({
              display_phone_number: z.string(),
              phone_number_id: z.string(),
            }).optional(),
            contacts: z.array(
              z.object({
                profile: z.object({
                  name: z.string(),
                }),
                wa_id: z.string(),
              })
            ).optional(),
            messages: z.array(
              z.object({
                from: z.string(),
                id: z.string(),
                timestamp: z.string(),
                text: z.object({
                  body: z.string(),
                }).optional(),
                type: z.string(),
              })
            ).optional(),
          }),
          field: z.string(),
        })
      ),
    })
  ),
});

// GET: Webhook verification challenge (Meta Standard)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
    console.log("[WHATSAPP WEBHOOK] Webhook verified successfully.");
    return new Response(challenge, { status: 200 });
  }

  console.warn("[WHATSAPP WEBHOOK] Verification failed: token mismatch.");
  return new Response("Forbidden", { status: 403 });
}

// POST: Process incoming WhatsApp messages
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const result = incomingMessageSchema.safeParse(rawBody);

    if (!result.success) {
      // Just return 200 OK so Meta doesn't retry, but log the warning
      console.warn("[WHATSAPP WEBHOOK] Invalid schema payload parsed.");
      return NextResponse.json({ success: false, error: "Invalid payload format" }, { status: 200 });
    }

    const entry = result.data.entry[0];
    const change = entry?.changes[0];
    const val = change?.value;
    const msg = val?.messages?.[0];

    if (!msg || msg.type !== "text" || !msg.text) {
      // Ignore media or system notifications
      return NextResponse.json({ success: true, message: "Ignored non-text message type" });
    }

    const fromPhone = msg.from;
    const bodyText = msg.text.body;
    const senderName = val?.contacts?.[0]?.profile?.name || "WhatsApp User";

    console.log(`[WHATSAPP WEBHOOK] Received message from ${senderName} (${fromPhone}): "${bodyText}"`);

    // 1. Resolve Contact and Tenant
    // Find contact by phone number across the database
    let contact = await prisma.contact.findFirst({
      where: { phone: fromPhone },
    });

    let tenantId = "tenant-a"; // Fallback to developer default tenant
    let isNewContact = false;

    if (contact) {
      tenantId = contact.tenantId;
    } else {
      isNewContact = true;
      // Resolve default tenant ID from seeded workspace
      const defaultTenant = await prisma.tenant.findFirst({
        where: { name: { contains: "Acme" } },
      });
      if (defaultTenant) {
        tenantId = defaultTenant.id;
      }

      // Create new contact under resolved tenant
      contact = await prisma.contact.create({
        data: {
          tenantId,
          name: senderName,
          phone: fromPhone,
          source: "WHATSAPP",
          tags: ["new"],
        },
      });
    }

    // 2. Find or create unified conversation for WhatsApp
    let conversation = await prisma.conversation.findFirst({
      where: { tenantId, contactId: contact.id, channel: "WHATSAPP" },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          tenantId,
          contactId: contact.id,
          channel: "WHATSAPP",
          sentiment: "NEUTRAL",
          aiSummary: "Incoming WhatsApp conversation.",
        },
      });
    }

    // 3. Log incoming message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        direction: "IN",
        content: bodyText,
        senderType: "CUSTOMER",
      },
    });

    // Touch conversation updated timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // 4. Trigger Lead Qualification automation pipeline
    // Run asynchronously to return response to Meta instantly
    runLeadQualificationWorkflow(tenantId, contact.id).catch((err) => {
      console.error("Failed to run lead qualification workflow asynchronously:", err);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing WhatsApp webhook POST:", error);
    // Return 200 to prevent Meta from retrying and flooding
    return NextResponse.json({ success: false, error: "Internal processing error" }, { status: 200 });
  }
}
