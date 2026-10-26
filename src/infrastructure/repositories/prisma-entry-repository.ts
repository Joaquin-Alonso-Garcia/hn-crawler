import type { Entry } from "@/src/domain/entry";
import type { EntryRepository } from "@/src/domain/entry-repository";
import type { PrismaClient } from "@/src/generated/prisma/client";

const ENTRY_FIELDS = {
  rank: true,
  title: true,
  points: true,
  commentCount: true,
} as const;

export class PrismaEntryRepository implements EntryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll(): Promise<Entry[]> {
    return this.prisma.entry.findMany({
      select: ENTRY_FIELDS,
      orderBy: { rank: "asc" },
    });
  }

  async findLastCrawledAt(): Promise<Date | null> {
    const latestEntry = await this.prisma.entry.findFirst({
      select: { crawledAt: true },
      orderBy: { crawledAt: "desc" },
    });

    return latestEntry?.crawledAt ?? null;
  }

  async replaceAll(entries: Entry[], crawledAt: Date): Promise<void> {
    const rows = entries.map((entry) => ({ ...entry, crawledAt }));

    await this.prisma.$transaction([
      this.prisma.entry.deleteMany(),
      this.prisma.entry.createMany({ data: rows }),
    ]);
  }
}
