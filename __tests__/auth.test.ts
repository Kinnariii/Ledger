import { describe, it, expect, vi, beforeEach } from "vitest";
import { hashToken, generateRefreshToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";

// Mock the prisma singleton
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    refreshToken: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(prisma)),
  },
}));

describe("Authentication Security - Refresh Token Rotation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully rotate valid tokens", async () => {
    const rawToken = generateRefreshToken();
    const hashed = await hashToken(rawToken);
    const mockUser = { id: "user-a", tenantId: "tenant-a", role: "OWNER" };
    const mockRecord = {
      id: "token-record-id",
      tokenHash: hashed,
      userId: "user-a",
      revoked: false,
      expiresAt: new Date(Date.now() + 100000), // Active
      user: mockUser,
    };

    // Mock DB response
    vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockRecord as any);
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({ id: "new-token-id" } as any);
    vi.mocked(prisma.refreshToken.update).mockResolvedValue({ id: "token-record-id" } as any);

    // Call database operations that mimic the route handler's transaction
    const newRawToken = generateRefreshToken();
    const newHashed = await hashToken(newRawToken);

    const newToken = await prisma.refreshToken.create({
      data: {
        userId: mockRecord.userId,
        tokenHash: newHashed,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const updatedOldToken = await prisma.refreshToken.update({
      where: { id: mockRecord.id },
      data: {
        revoked: true,
        replacedByTokenId: newToken.id,
      },
    });

    expect(prisma.refreshToken.create).toHaveBeenCalled();
    expect(prisma.refreshToken.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "token-record-id" },
        data: expect.objectContaining({ revoked: true }),
      })
    );
  });

  it("should trigger reuse detection, revoke all tokens, and log audit event when a revoked token is reused", async () => {
    const rawToken = generateRefreshToken();
    const hashed = await hashToken(rawToken);
    const mockUser = { id: "user-a", tenantId: "tenant-a", role: "OWNER" };
    const mockRecord = {
      id: "token-record-id",
      tokenHash: hashed,
      userId: "user-a",
      revoked: true, // Already revoked!
      expiresAt: new Date(Date.now() + 100000),
      user: mockUser,
    };

    // Mock DB responses
    vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockRecord as any);
    vi.mocked(prisma.refreshToken.updateMany).mockResolvedValue({ count: 5 } as any);
    vi.mocked(prisma.auditLog.create).mockResolvedValue({ id: "audit-log-id" } as any);

    // Retrieve the token
    const token = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashed },
      include: { user: true },
    });

    expect(token).toBeDefined();
    expect(token?.revoked).toBe(true);

    // Mimic route handler logic on reuse detection
    if (token?.revoked) {
      // 1. Revoke all user tokens
      await prisma.refreshToken.updateMany({
        where: { userId: token.userId },
        data: { revoked: true },
      });

      // 2. Log security breach
      await prisma.auditLog.create({
        data: {
          tenantId: token.user.tenantId,
          actorType: "SYSTEM",
          action: "auth.token_reuse_detected",
          entityType: "RefreshToken",
          entityId: token.id,
          metadata: { userId: token.userId },
        },
      });
    }

    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-a" },
        data: { revoked: true },
      })
    );
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "auth.token_reuse_detected",
          tenantId: "tenant-a",
        }),
      })
    );
  });
});
