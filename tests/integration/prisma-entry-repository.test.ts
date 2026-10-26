import { describe, expect, it } from "vitest";
import type { Entry } from "@/src/domain/entry";
import { PrismaEntryRepository } from "@/src/infrastructure/repositories/prisma-entry-repository";
import { setUpTestDatabase } from "./test-database";

const FIRST_CRAWL = new Date("2026-10-25T10:00:00.000Z");
const SECOND_CRAWL = new Date("2026-10-25T10:20:00.000Z");

function buildEntry(rank: number): Entry {
  return {
    rank,
    title: `Story ${rank}`,
    points: rank * 10,
    commentCount: rank,
  };
}

describe("PrismaEntryRepository", () => {
  const repository = new PrismaEntryRepository(setUpTestDatabase());

  it("reports no entries and no crawl before anything is stored", async () => {
    await expect(repository.findAll()).resolves.toEqual([]);
    await expect(repository.findLastCrawledAt()).resolves.toBeNull();
  });

  it("stores a batch and returns it ordered by rank", async () => {
    await repository.replaceAll(
      [buildEntry(3), buildEntry(1), buildEntry(2)],
      FIRST_CRAWL,
    );

    await expect(repository.findAll()).resolves.toEqual([
      buildEntry(1),
      buildEntry(2),
      buildEntry(3),
    ]);
    await expect(repository.findLastCrawledAt()).resolves.toEqual(FIRST_CRAWL);
  });

  it("replaces the previous batch entirely", async () => {
    await repository.replaceAll([buildEntry(1), buildEntry(2)], FIRST_CRAWL);
    await repository.replaceAll([buildEntry(5)], SECOND_CRAWL);

    await expect(repository.findAll()).resolves.toEqual([buildEntry(5)]);
    await expect(repository.findLastCrawledAt()).resolves.toEqual(SECOND_CRAWL);
  });
});
