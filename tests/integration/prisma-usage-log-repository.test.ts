import { describe, expect, it } from "vitest";
import type { UsageLog } from "@/src/domain/usage-log";
import { PrismaUsageLogRepository } from "@/src/infrastructure/repositories/prisma-usage-log-repository";
import { setUpTestDatabase } from "./test-database";

describe("PrismaUsageLogRepository", () => {
  const prisma = setUpTestDatabase();
  const repository = new PrismaUsageLogRepository(prisma);

  it("persists every field of a usage log", async () => {
    const log: UsageLog = {
      timestamp: new Date("2026-10-25T10:00:00.000Z"),
      appliedFilter: "long-titles",
      resultCount: 12,
      durationMs: 85,
      triggeredCrawl: true,
    };

    await repository.record(log);

    await expect(
      prisma.usageLog.findMany({ omit: { id: true } }),
    ).resolves.toEqual([log]);
  });
});
