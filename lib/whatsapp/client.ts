export interface WhatsAppClient {
  sendMessage(
    tenantId: string,
    contactId: string,
    toPhone: string,
    text: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }>;
}
