import { getConversations } from "@/lib/db/scoped";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import InboxClient from "./InboxClient";

export default async function InboxPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const conversations = await getConversations(session.tenantId);

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
