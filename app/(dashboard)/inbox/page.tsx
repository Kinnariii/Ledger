import { getConversations } from "@/lib/db/scoped";
import InboxClient from "./InboxClient";

// TEMP: replace with session tenantId once Phase B auth lands
const TEMP_TENANT_ID = "tenant-a";

export default async function InboxPage() {
  const conversations = await getConversations(TEMP_TENANT_ID);

  // Cast sub-types to match frontend type requirements if needed
  const mappedConversations = conversations.map((conv) => ({
    ...conv,
    channel: conv.channel as any,
    sentiment: conv.sentiment as any,
    messages: conv.messages.map((m) => ({
      ...m,
      direction: m.direction as any,
      senderType: m.senderType as any,
    })),
  }));

  return <InboxClient conversations={mappedConversations} />;
}
