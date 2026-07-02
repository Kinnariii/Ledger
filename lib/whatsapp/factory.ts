import { WhatsAppClient } from "./client";
import { MockWhatsAppClient } from "./adapters/mock";
import { MetaWhatsAppClient } from "./adapters/meta";

let clientInstance: WhatsAppClient | null = null;

export function getWhatsAppClient(): WhatsAppClient {
  if (clientInstance) {
    return clientInstance;
  }

  const provider = process.env.WHATSAPP_PROVIDER || "mock";

  if (provider.toLowerCase() === "meta") {
    clientInstance = new MetaWhatsAppClient();
  } else {
    clientInstance = new MockWhatsAppClient();
  }

  console.log(`[WHATSAPP] Resolved client adapter: ${clientInstance.constructor.name}`);
  return clientInstance;
}
