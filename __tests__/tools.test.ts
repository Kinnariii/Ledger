import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchContactsTool, createTaskTool, sendWhatsappTool } from "@/lib/ai/tools";
import { prisma } from "@/lib/db/prisma";
import { TaskStatus, TaskCreator } from "@prisma/client";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    contact: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    task: {
      create: vi.fn(),
    },
    conversation: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    message: {
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

describe("AI Agent Tools - Database Bindings and Auditing", () => {
  const tenantId = "tenant-a";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searchContactsTool should query database and write an AuditLog", async () => {
    vi.mocked(prisma.contact.findMany).mockResolvedValue([{ id: "contact-1", name: "Rahul" }] as any);
    vi.mocked(prisma.auditLog.create).mockResolvedValue({ id: "audit-1" } as any);

    const result = await searchContactsTool(tenantId, "Rahul");

    expect(result).toHaveLength(1);
    expect(prisma.contact.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId,
        }),
      })
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "tool.search_contacts",
          tenantId,
        }),
      })
    );
  });

  it("createTaskTool should create a pending AI-sourced task and log audit", async () => {
    vi.mocked(prisma.task.create).mockResolvedValue({ id: "task-1", title: "Call Rahul" } as any);
    vi.mocked(prisma.auditLog.create).mockResolvedValue({ id: "audit-2" } as any);

    const args = { title: "Call Rahul", dueAt: "2026-07-03T10:00:00Z", contactId: "contact-1" };
    const result = await createTaskTool(tenantId, args);

    expect(result.id).toBe("task-1");
    expect(prisma.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId,
          title: "Call Rahul",
          status: TaskStatus.PENDING,
          createdBy: TaskCreator.AI,
        }),
      })
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "tool.create_task",
          entityType: "Task",
        }),
      })
    );
  });

  it("sendWhatsappTool should create conversation, append message, touch timestamps and log audit", async () => {
    // Mock contact verification
    vi.mocked(prisma.contact.findFirst).mockResolvedValue({ id: "contact-1", name: "Rahul", tenantId } as any);
    // Mock conversation find
    vi.mocked(prisma.conversation.findFirst).mockResolvedValue({ id: "conv-1" } as any);
    // Mock message create
    vi.mocked(prisma.message.create).mockResolvedValue({ id: "msg-1" } as any);
    // Mock conversation update touch
    vi.mocked(prisma.conversation.update).mockResolvedValue({ id: "conv-1" } as any);
    // Mock audit log
    vi.mocked(prisma.auditLog.create).mockResolvedValue({ id: "audit-3" } as any);

    const args = { contactId: "contact-1", content: "Hello from AI" };
    const result = await sendWhatsappTool(tenantId, args);

    expect(result.success).toBe(true);
    expect(prisma.message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          conversationId: "conv-1",
          direction: "OUT",
          senderType: "AI",
          content: "Hello from AI",
        }),
      })
    );
    expect(prisma.conversation.update).toHaveBeenCalled();
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "tool.send_whatsapp",
          entityType: "Message",
        }),
      })
    );
  });
});
