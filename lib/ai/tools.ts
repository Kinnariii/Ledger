import { prisma } from "@/lib/db/prisma";
import { OpportunityStage, TaskStatus, TaskCreator } from "@prisma/client";

// Stage mapping to handle casing robustly
const STAGE_MAP: Record<string, OpportunityStage> = {
  new: "NEW",
  qualified: "QUALIFIED",
  proposal: "PROPOSAL",
  won: "WON",
  lost: "LOST",
};

// 1. Search Contacts
export async function searchContactsTool(tenantId: string, query: string) {
  const contacts = await prisma.contact.findMany({
    where: {
      tenantId,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { phone: { contains: query } },
      ],
    },
    take: 10,
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      actorType: "AI",
      actorId: "ledger-agent",
      action: "tool.search_contacts",
      entityType: "Contact",
      metadata: { query, resultsCount: contacts.length },
    },
  });

  return contacts;
}

// 2. Create Task
export async function createTaskTool(
  tenantId: string,
  args: {
    title: string;
    dueAt?: string;
    contactId?: string;
    opportunityId?: string;
  }
) {
  const { title, dueAt, contactId, opportunityId } = args;

  const resolvedDueAt = dueAt ? new Date(dueAt) : null;

  const task = await prisma.task.create({
    data: {
      tenantId,
      title,
      dueAt: resolvedDueAt,
      contactId: contactId || null,
      opportunityId: opportunityId || null,
      status: TaskStatus.PENDING,
      createdBy: TaskCreator.AI,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      actorType: "AI",
      actorId: "ledger-agent",
      action: "tool.create_task",
      entityType: "Task",
      entityId: task.id,
      metadata: { args, taskId: task.id },
    },
  });

  return task;
}

// 3. Update Opportunity
export async function updateOpportunityTool(
  tenantId: string,
  args: {
    id: string;
    stage: string;
    value?: number;
  }
) {
  const { id, stage, value } = args;

  // Verify opportunity belongs to tenant
  const existing = await prisma.opportunity.findFirst({
    where: { id, tenantId },
  });

  if (!existing) {
    throw new Error(`Opportunity with ID ${id} not found in this tenant.`);
  }

  const dbStage = STAGE_MAP[stage.toLowerCase()];
  if (!dbStage && stage) {
    throw new Error(`Invalid opportunity stage: ${stage}. Allowed: NEW, QUALIFIED, PROPOSAL, WON, LOST.`);
  }

  const updated = await prisma.opportunity.update({
    where: { id },
    data: {
      stage: dbStage || existing.stage,
      value: value !== undefined ? value : existing.value,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      actorType: "AI",
      actorId: "ledger-agent",
      action: "tool.update_opportunity",
      entityType: "Opportunity",
      entityId: updated.id,
      metadata: { args, updatedStage: updated.stage, updatedValue: updated.value },
    },
  });

  return updated;
}

// 4. Send WhatsApp message (mock)
export async function sendWhatsappTool(
  tenantId: string,
  args: {
    contactId: string;
    content: string;
  }
) {
  const { contactId, content } = args;

  // Verify contact exists in tenant
  const contact = await prisma.contact.findFirst({
    where: { id: contactId, tenantId },
  });

  if (!contact) {
    throw new Error(`Contact with ID ${contactId} not found in this tenant.`);
  }

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

  // Create message log
  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      direction: "OUT",
      content,
      senderType: "AI",
    },
  });

  // Touch conversation timestamp
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  // Audit log entry
  await prisma.auditLog.create({
    data: {
      tenantId,
      actorType: "AI",
      actorId: "ledger-agent",
      action: "tool.send_whatsapp",
      entityType: "Message",
      entityId: message.id,
      metadata: { contactId, content, messageId: message.id },
    },
  });

  return { success: true, messageId: message.id, channel: "WHATSAPP" };
}

// 5. Fetch Business Metrics
export async function fetchBusinessMetricsTool(tenantId: string) {
  const [pipelineResult, openOpportunities, pendingTasks, totalContacts] =
    await Promise.all([
      prisma.opportunity.aggregate({
        where: { tenantId, stage: { not: "LOST" } },
        _sum: { value: true },
      }),
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

  const metrics = {
    activePipeline: pipelineResult._sum.value ?? 0,
    openOpportunities,
    pendingTasks,
    totalContacts,
  };

  await prisma.auditLog.create({
    data: {
      tenantId,
      actorType: "AI",
      actorId: "ledger-agent",
      action: "tool.fetch_business_metrics",
      entityType: "Tenant",
      metadata: { metrics },
    },
  });

  return metrics;
}

// Declarations array matching the format expected by Google Gen AI SDK
export const GEMINI_TOOLS_DECLARATION = [
  {
    functionDeclarations: [
      {
        name: "search_contacts",
        description: "Search for contacts (leads/customers) within the business. Returns contact details like ID, name, email, and phone.",
        parameters: {
          type: "OBJECT",
          properties: {
            query: {
              type: "STRING",
              description: "The name, email, or partial phone number to search for.",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "create_task",
        description: "Schedule a task or follow-up action for the user.",
        parameters: {
          type: "OBJECT",
          properties: {
            title: {
              type: "STRING",
              description: "What the task is (e.g. 'Call Rahul Sharma').",
            },
            dueAt: {
              type: "STRING",
              description: "ISO-8601 date string when the task is due (e.g. '2026-07-03T10:00:00Z').",
            },
            contactId: {
              type: "STRING",
              description: "Optional database contact ID to link this task to.",
            },
            opportunityId: {
              type: "STRING",
              description: "Optional database opportunity ID to link this task to.",
            },
          },
          required: ["title"],
        },
      },
      {
        name: "update_opportunity",
        description: "Update the stage or monetary value of an existing sales opportunity.",
        parameters: {
          type: "OBJECT",
          properties: {
            id: {
              type: "STRING",
              description: "The opportunity's unique database ID.",
            },
            stage: {
              type: "STRING",
              description: "The new stage (e.g. 'NEW', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST').",
            },
            value: {
              type: "NUMBER",
              description: "The monetary value in INR (e.g. 50000).",
            },
          },
          required: ["id", "stage"],
        },
      },
      {
        name: "send_whatsapp",
        description: "Send a mock WhatsApp message to a contact to follow up or share information.",
        parameters: {
          type: "OBJECT",
          properties: {
            contactId: {
              type: "STRING",
              description: "The database ID of the contact to message.",
            },
            content: {
              type: "STRING",
              description: "The text message content to send.",
            },
          },
          required: ["contactId", "content"],
        },
      },
      {
        name: "fetch_business_metrics",
        description: "Retrieve dashboard KPIs including active pipeline sum, open opportunities, pending tasks, and contacts count.",
        parameters: {
          type: "OBJECT",
          properties: {},
        },
      },
    ],
  },
];

// Helper to route and execute tool calls
export async function executeTool(tenantId: string, name: string, args: any): Promise<any> {
  console.log(`Executing tool: ${name} with args:`, args);

  switch (name) {
    case "search_contacts":
      return searchContactsTool(tenantId, args.query);
    case "create_task":
      return createTaskTool(tenantId, args);
    case "update_opportunity":
      return updateOpportunityTool(tenantId, args);
    case "send_whatsapp":
      return sendWhatsappTool(tenantId, args);
    case "fetch_business_metrics":
      return fetchBusinessMetricsTool(tenantId);
    default:
      throw new Error(`Unknown tool name: ${name}`);
  }
}
