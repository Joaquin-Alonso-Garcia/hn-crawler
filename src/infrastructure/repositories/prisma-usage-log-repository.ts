import type { UsageLog } from "@/src/domain/usage-log";
import type { UsageLogRepository } from "@/src/domain/usage-log-repository";
import type { PrismaClient } from "@/src/generated/prisma/client";

export class PrismaUsageLogRepository implements UsageLogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async record(log: UsageLog): Promise<void> {
    await this.prisma.usageLog.create({ data: log });
  }
}
