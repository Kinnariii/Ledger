import { WhatsAppClient } from "../client";
import { prisma } from "@/lib/db/prisma";

export class MockWhatsAppClient implements WhatsAppClient {
  async sendMessage(
    tenantId: string,
    contactId: string,
    toPhone: string,
    text: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log(`[MOCK WHATSAPP] Sending message to ${toPhone}: "${text}"`);

    try {
      // Find or create conversation for WHATSAPP
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
            aiSummary: "AI initiated follow-up conversation.",
          },
        });
      }

      // Create outbound message log
      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          direction: "OUT",
          content: text,
          senderType: "AI",
        },
      });

      // Touch conversation timestamp
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });

      return { success: true, messageId: message.id };
    } catch (error: any) {
      console.error("[MOCK WHATSAPP] Error sending message:", error);
      return { success: false, error: error.message };
    }
  }
}
