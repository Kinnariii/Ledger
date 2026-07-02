import { getAiChatConversations } from "@/lib/db/scoped";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import ChatClient, { Chat, Message } from "./ChatClient";

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateLabel(date: Date): string {
  const today = new Date();
  const d = new Date(date);
  
  if (d.toDateString() === today.toDateString()) {
    return `Today, ${formatTime(d)}`;
  }
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

export default async function ChatPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const chatSessions = await getAiChatConversations(session.tenantId, session.userId);

  // Map database conversations to client structure
  const mappedChats: Chat[] = chatSessions.map((conv) => {
    const messages: Message[] = conv.messages.map((m) => {
      // Parse tool calls JSON column if present
      let toolCalls: any[] = [];
      if (m.toolCalls) {
        try {
          toolCalls = typeof m.toolCalls === "string" ? JSON.parse(m.toolCalls) : m.toolCalls;
        } catch (e) {
          toolCalls = [];
        }
      }

      return {
        role: m.role as any, // "USER" or "ASSISTANT"
        content: m.content,
        time: formatTime(m.createdAt),
        // If it's an assistant response, extract or mock reasoning, and map tool calls
        reasoning: m.role === "ASSISTANT" ? (toolCalls.length > 0 ? `Executed tools to fetch data.` : undefined) : undefined,
        toolCalls: toolCalls,
      };
    });

    return {
      id: conv.id,
      title: conv.title,
      timestamp: formatDateLabel(conv.updatedAt),
      messages,
    };
  });

  return <ChatClient initialChats={mappedChats} />;
}
