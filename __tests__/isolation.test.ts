import { describe, it, expect, vi, beforeEach } from "vitest";
import { getContacts, getOpportunities, getConversations } from "@/lib/db/scoped";
import { prisma } from "@/lib/db/prisma";

// Mock the prisma singleton
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    contact: {
      findMany: vi.fn(),
    },
    opportunity: {
      findMany: vi.fn(),
    },
    conversation: {
      findMany: vi.fn(),
    },
  },
}));

describe("Tenant Data Isolation Enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should scope getContacts query to the requested tenantId only", async () => {
    const tenantId = "tenant-test-a";
    vi.mocked(prisma.contact.findMany).mockResolvedValue([] as any);

    await getContacts(tenantId);

    expect(prisma.contact.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId },
      })
    );
  });

  it("should scope getOpportunities query to the requested tenantId only", async () => {
    const tenantId = "tenant-test-b";
    vi.mocked(prisma.opportunity.findMany).mockResolvedValue([] as any);

    await getOpportunities(tenantId);

    expect(prisma.opportunity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId },
      })
    );
  });

  it("should scope getConversations query to the requested tenantId only", async () => {
    const tenantId = "tenant-test-c";
    vi.mocked(prisma.conversation.findMany).mockResolvedValue([] as any);

    await getConversations(tenantId);

    expect(prisma.conversation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId },
      })
    );
  });
});
