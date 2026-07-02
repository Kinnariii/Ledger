import { WhatsAppClient } from "../client";
import { prisma } from "@/lib/db/prisma";

export class MetaWhatsAppClient implements WhatsAppClient {
  async sendMessage(
    tenantId: string,
    contactId: string,
    toPhone: string,
    text: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneId) {
      console.error("[META WHATSAPP] Configuration missing. Cannot send real WhatsApp message.");
      return { success: false, error: "Meta API credentials not configured." };
    }

    // Clean phone number (remove spaces, dashes, plus sign if Meta API requires it)
    const cleanPhone = toPhone.replace(/[\s\-\+]/g, "");
    console.log(`[META WHATSAPP] Sending message to ${cleanPhone} via Meta API...`);

    try {
      const response = await fetch(
        `https://graph.facebook.com/v17.0/${phoneId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: cleanPhone,
            type: "text",
            text: {
              body: text,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("[META WHATSAPP] Meta API response error:", data);
        return {
          success: false,
          error: data.error?.message || "Failed to send message via Meta API",
        };
      }

      // Meta successfully processed request
      const metaMessageId = data.messages?.[0]?.id || "meta-msg-id-fallback";
      console.log(`[META WHATSAPP] Successfully sent message. Meta ID: ${metaMessageId}`);

      // Persist to local database so it shows up in UI
      let conversation = await prisma.conversation.findFirst({
        where: { tenantId, contactId, channel: "WHATSAPP" },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            tenantId,
            contactId,
            channel: "WHATSAPP",
            sentiment: "NEUTRAL",
            aiSummary: "AI initiated follow-up conversation via Meta API.",
          },
        });
      }

      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          direction: "OUT",
          content: text,
          senderType: "AI",
        },
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });

      return { success: true, messageId: message.id };
    } catch (error: any) {
      console.error("[META WHATSAPP] Fetch execution error:", error);
      return { success: false, error: error.message || "Failed to execute fetch request to Meta API" };
    }
  }
}
