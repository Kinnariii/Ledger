import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getAiService } from "@/lib/ai/gemini";
import { buildSystemInstruction } from "@/lib/ai/prompts";
import { MessageHistory } from "@/lib/ai/provider";
import { AiChatRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    // 1. Resolve session
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, tenantId } = session;

    // 2. Parse request payload
    const body = await request.json();
    const { message, conversationId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing message text" }, { status: 400 });
    }

    // 3. Resolve active chat session or create a new one
    let conversation = conversationId
      ? await prisma.aiChatConversation.findFirst({
          where: { id: conversationId, tenantId, userId },
        })
      : null;

    if (!conversation) {
      // Auto-generate a title based on the message
      const title = message.length > 25 ? message.substring(0, 22) + "..." : message;
      conversation = await prisma.aiChatConversation.create({
        data: {
          tenantId,
          userId,
          title,
        },
      });
    }

    // 4. Retrieve historical messages for context
    const dbMessages = await prisma.aiChatMessage.findMany({
      where: { aiChatConversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 15,
    });

    const history: MessageHistory[] = dbMessages
      .filter((m) => m.role !== "TOOL") // Filter out raw tool rows if any
      .map((m) => ({
        role: m.role === "USER" ? "user" : "model",
        content: m.content,
      }));

    // 5. Fetch Tenant Profile Context
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        name: true,
        businessType: true,
        onboardingData: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const systemInstruction = buildSystemInstruction(tenant);

    // 6. Execute Gemini AI Agent with tool calling capabilities
    const aiService = getAiService();
    const result = await aiService.generateWithTools(
      systemInstruction,
      message,
      history,
      tenantId,
      userId
    );

    // 7. Persist messages to the database
    // Save User message
    await prisma.aiChatMessage.create({
      data: {
        aiChatConversationId: conversation.id,
        role: AiChatRole.USER,
        content: message,
      },
    });

    // Save Assistant message (including reasoning and any tool calls/results)
    const assistantMessage = await prisma.aiChatMessage.create({
      data: {
        aiChatConversationId: conversation.id,
        role: AiChatRole.ASSISTANT,
        content: result.text,
        toolCalls: result.toolCalls.map((t) => ({ name: t.name, args: t.args })) as any,
        toolResults: result.toolCalls.map((t) => ({ name: t.name, result: t.result })) as any,
      },
    });

    // Update conversation updatedAt timestamp
    await prisma.aiChatConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // 8. Stream the response tokens back to the client using Server-Sent Events (SSE)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send conversation metadata
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "meta", conversationId: conversation.id, title: conversation.title })}\n\n`
            )
          );

          // Send reasoning explainability line
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "reasoning", content: result.reasoning })}\n\n`
            )
          );

          // Send executed tool calls for visibility
          if (result.toolCalls.length > 0) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "tool_calls",
                  content: result.toolCalls.map((t) => ({ name: t.name, args: t.args })),
                })}\n\n`
              )
            );
          }

          // Simulate streaming chunk-by-chunk for smooth typing animation
          const text = result.text;
          const words = text.split(" ");
          
          for (let i = 0; i < words.length; i++) {
            const chunk = words[i] + (i < words.length - 1 ? " " : "");
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "chunk", content: chunk })}\n\n`)
            );
            // Small artificial delay for visual streaming typing effect
            await new Promise((resolve) => setTimeout(resolve, 30));
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Error in AI Chat API route:", error);
    return NextResponse.json(
      { error: "Internal server error during chat processing: " + error.message },
      { status: 500 }
    );
  }
}
