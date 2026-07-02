/**
 * Tenant-Scoped Data Access Layer
 * ================================
 * Every function takes `tenantId` as a required first argument and
 * filters every query by it. This is the ONLY way data should be
 * fetched from the database in Ledger.
 *
 * Structural enforcement: if you forget tenantId, the code won't compile.
 *
 * IMPORTANT: Always import from this file for data fetching.
 * Never write raw prisma queries in route handlers or pages.
 */
import { prisma } from "./prisma";

// ─── Dashboard ──────────────────────────────────────────────────────────

export interface DashboardKPIs {
  activePipeline: number;
  openOpportunities: number;
  pendingTasks: number;
  totalContacts: number;
}

export async function getDashboardKPIs(tenantId: string): Promise<DashboardKPIs> {
  const [pipelineResult, openOpportunities, pendingTasks, totalContacts] =
    await Promise.all([
      // Active pipeline = sum of value for non-LOST opportunities
      prisma.opportunity.aggregate({
        where: { tenantId, stage: { not: "LOST" } },
        _sum: { value: true },
      }),
      // Open opportunities = not WON and not LOST
      prisma.opportunity.count({
        where: { tenantId, stage: { notIn: ["WON", "LOST"] } },
      }),
      prisma.task.count({
        where: { tenantId, status: "PENDING" },
      }),
      prisma.contact.count({
        where: { tenantId },
      }),
    ]);

  return {
    activePipeline: pipelineResult._sum.value ?? 0,
    openOpportunities,
    pendingTasks,
    totalContacts,
  };
}

export interface RecentActivityItem {
  time: Date;
  text: string;
  type: "WHATSAPP" | "EMAIL" | "CALL" | "AI" | "SYSTEM";
}

export async function getRecentActivity(
  tenantId: string,
  limit = 10,
): Promise<RecentActivityItem[]> {
  // Fetch latest messages across all conversations for this tenant
  const conversations = await prisma.conversation.findMany({
    where: { tenantId },
    select: {
      id: true,
      channel: true,
      contact: { select: { name: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          content: true,
          direction: true,
          senderType: true,
          createdAt: true,
          metadata: true,
        },
      },
    },
  });

  const items: RecentActivityItem[] = [];

  for (const conv of conversations) {
    const msg = conv.messages[0];
    if (!msg) continue;

    let text: string;
    const contactName = conv.contact.name;

    if (msg.senderType === "AI") {
      text = `Ledger sent AI follow-up to ${contactName}`;
    } else if (msg.direction === "IN") {
      if (conv.channel === "CALL") {
        // Extract call duration from metadata if available
        const metadata = msg.metadata as Record<string, unknown> | null;
        const duration = metadata?.duration ?? "";
        text = `${duration ? `Discovery call with ${contactName} (${duration})` : `Call from ${contactName}`}`;
      } else {
        text = `${contactName} sent a ${conv.channel === "WHATSAPP" ? "WhatsApp" : "Email"} message`;
      }
    } else {
      text = `Replied to ${contactName} via ${conv.channel === "WHATSAPP" ? "WhatsApp" : conv.channel === "EMAIL" ? "Email" : "Call"}`;
    }

    items.push({
      time: msg.createdAt,
      text,
      type: msg.senderType === "AI" ? "AI" : conv.channel,
    });
  }

  // Sort by time descending and take the limit
  items.sort((a, b) => b.time.getTime() - a.time.getTime());
  return items.slice(0, limit);
}

export async function getPendingTasks(tenantId: string) {
  return prisma.task.findMany({
    where: { tenantId, status: "PENDING" },
    include: {
      contact: { select: { name: true } },
      opportunity: { select: { title: true } },
    },
    orderBy: { dueAt: "asc" },
  });
}

// ─── Contacts ───────────────────────────────────────────────────────────

export async function getContacts(tenantId: string) {
  return prisma.contact.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Opportunities ──────────────────────────────────────────────────────

export async function getOpportunities(tenantId: string) {
  return prisma.opportunity.findMany({
    where: { tenantId },
    include: {
      contact: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Conversations (Inbox) ──────────────────────────────────────────────

export async function getConversations(tenantId: string) {
  return prisma.conversation.findMany({
    where: { tenantId },
    include: {
      contact: { select: { name: true } },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

// ─── AI Chat ────────────────────────────────────────────────────────────

export async function getAiChatConversations(tenantId: string, userId: string) {
  return prisma.aiChatConversation.findMany({
    where: { tenantId, userId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

// ─── Search (for AI tools) ──────────────────────────────────────────────

export async function searchContacts(tenantId: string, query: string) {
  return prisma.contact.findMany({
    where: {
      tenantId,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { phone: { contains: query } },
      ],
    },
  });
}

// ─── Audit Log ──────────────────────────────────────────────────────────

export async function getAuditLogs(tenantId: string, limit = 50) {
  return prisma.auditLog.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
