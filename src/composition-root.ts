import { FreshEntriesLoader } from "@/src/application/fresh-entries-loader";
import { GetEntriesUseCase } from "@/src/application/get-entries-use-case";
import { CRAWL_TTL_MS } from "@/src/config";
import { getPrismaClient } from "@/src/infrastructure/prisma/client";
import { PrismaEntryRepository } from "@/src/infrastructure/repositories/prisma-entry-repository";
import { PrismaUsageLogRepository } from "@/src/infrastructure/repositories/prisma-usage-log-repository";
import { HackerNewsEntrySource } from "@/src/infrastructure/scraper/hacker-news-entry-source";

const systemClock = (): Date => new Date();

function createGetEntriesUseCase(): GetEntriesUseCase {
  const prisma = getPrismaClient();
  const loader = new FreshEntriesLoader(
    new PrismaEntryRepository(prisma),
    new HackerNewsEntrySource(),
    systemClock,
    CRAWL_TTL_MS,
  );

  return new GetEntriesUseCase(
    loader,
    new PrismaUsageLogRepository(prisma),
    systemClock,
  );
}

// A single long-lived instance lets concurrent requests share one in-flight crawl.
let getEntriesUseCaseInstance: GetEntriesUseCase | undefined;

export function getEntriesUseCase(): GetEntriesUseCase {
  getEntriesUseCaseInstance ??= createGetEntriesUseCase();

  return getEntriesUseCaseInstance;
}
