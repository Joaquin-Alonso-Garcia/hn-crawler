import { afterAll, beforeEach, inject } from "vitest";
import { createPrismaClient } from "@/src/infrastructure/prisma/client";
import type { PrismaClient } from "@/src/generated/prisma/client";

export function setUpTestDatabase(): PrismaClient {
  const prisma = createPrismaClient(inject("databaseUrl"));

  beforeEach(async () => {
    await prisma.$transaction([
      prisma.entry.deleteMany(),
      prisma.usageLog.deleteMany(),
    ]);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  return prisma;
}
