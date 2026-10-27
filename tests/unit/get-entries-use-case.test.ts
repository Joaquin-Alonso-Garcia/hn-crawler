import { describe, expect, it } from "vitest";
import { FreshEntriesLoader } from "@/src/application/fresh-entries-loader";
import { GetEntriesUseCase } from "@/src/application/get-entries-use-case";
import { CRAWL_TTL_MS } from "@/src/config";
import type { Entry } from "@/src/domain/entry";
import { EntrySourceError } from "@/src/domain/entry-source";
import { FilterType, NO_FILTER } from "@/src/domain/filters/filter-type";
import { UsageOutcome } from "@/src/domain/usage-log";
import { FakeClock } from "../fakes/fake-clock";
import { InMemoryEntryRepository } from "../fakes/in-memory-entry-repository";
import { InMemoryUsageLogRepository } from "../fakes/in-memory-usage-log-repository";

const CRAWL_DURATION_MS = 120;
const START = new Date("2026-10-26T10:00:00.000Z");

const fiveWordTitle: Entry = {
  rank: 1,
  title: "A five word title here",
  points: 10,
  commentCount: 50,
};
const longTitleMostPoints: Entry = {
  rank: 2,
  title: "This title has clearly more than five words",
  points: 99,
  commentCount: 5,
};
const oneWordTitle: Entry = {
  rank: 3,
  title: "Tiny",
  points: 70,
  commentCount: 0,
};
const longTitleMostComments: Entry = {
  rank: 4,
  title: "Another title that is long enough to count",
  points: 1,
  commentCount: 80,
};
const ENTRIES = [
  fiveWordTitle,
  longTitleMostPoints,
  oneWordTitle,
  longTitleMostComments,
];

type Crawl = (clock: FakeClock) => Promise<Entry[]>;

function crawlReturning(entries: Entry[]): Crawl {
  return async (clock) => {
    clock.advance(CRAWL_DURATION_MS);

    return entries;
  };
}

function crawlFailingWith(error: Error): Crawl {
  return async (clock) => {
    clock.advance(CRAWL_DURATION_MS);
    throw error;
  };
}

function setUp(crawl: Crawl = crawlReturning(ENTRIES)) {
  const clock = new FakeClock(START);
  const usageLogRepository = new InMemoryUsageLogRepository();
  const source = { fetchTopEntries: () => crawl(clock) };
  const loader = new FreshEntriesLoader(
    new InMemoryEntryRepository(),
    source,
    clock.now,
    CRAWL_TTL_MS,
  );
  const useCase = new GetEntriesUseCase(loader, usageLogRepository, clock.now);

  return { useCase, usageLogRepository };
}

describe("GetEntriesUseCase", () => {
  it("returns every entry in rank order when no filter is requested", async () => {
    const { useCase } = setUp();

    await expect(useCase.execute(null)).resolves.toEqual({
      entries: ENTRIES,
      appliedFilter: NO_FILTER,
      crawledAt: new Date(START.getTime() + CRAWL_DURATION_MS),
    });
  });

  it.each([
    [FilterType.LongTitles, [longTitleMostComments, longTitleMostPoints]],
    [FilterType.ShortTitles, [oneWordTitle, fiveWordTitle]],
  ])("applies the %s filter", async (filterType, expectedEntries) => {
    const { useCase } = setUp();

    await expect(useCase.execute(filterType)).resolves.toMatchObject({
      entries: expectedEntries,
      appliedFilter: filterType,
    });
  });

  it("records one usage log per request", async () => {
    const { useCase, usageLogRepository } = setUp();

    await useCase.execute(FilterType.LongTitles);
    await useCase.execute(null);

    expect(usageLogRepository.logs).toEqual([
      {
        timestamp: START,
        appliedFilter: FilterType.LongTitles,
        resultCount: 2,
        durationMs: CRAWL_DURATION_MS,
        triggeredCrawl: true,
        outcome: UsageOutcome.Success,
      },
      {
        timestamp: new Date(START.getTime() + CRAWL_DURATION_MS),
        appliedFilter: NO_FILTER,
        resultCount: ENTRIES.length,
        durationMs: 0,
        triggeredCrawl: false,
        outcome: UsageOutcome.Success,
      },
    ]);
  });

  it.each([
    [
      "Hacker News is unavailable",
      new EntrySourceError("HTTP 503"),
      UsageOutcome.SourceUnavailable,
      true,
    ],
    [
      "anything else fails",
      new Error("database locked"),
      UsageOutcome.Error,
      false,
    ],
  ])(
    "records a failed request when %s, then rethrows",
    async (_case, error, outcome, triggeredCrawl) => {
      const { useCase, usageLogRepository } = setUp(crawlFailingWith(error));

      await expect(useCase.execute(FilterType.ShortTitles)).rejects.toBe(error);
      expect(usageLogRepository.logs).toEqual([
        {
          timestamp: START,
          appliedFilter: FilterType.ShortTitles,
          resultCount: 0,
          durationMs: CRAWL_DURATION_MS,
          triggeredCrawl,
          outcome,
        },
      ]);
    },
  );
});
