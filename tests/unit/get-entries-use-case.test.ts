import { describe, expect, it } from "vitest";
import { FreshEntriesLoader } from "@/src/application/fresh-entries-loader";
import { GetEntriesUseCase } from "@/src/application/get-entries-use-case";
import type { Entry } from "@/src/domain/entry";
import { FilterType, NO_FILTER } from "@/src/domain/filters/filter-type";
import { FakeClock } from "../fakes/fake-clock";
import { InMemoryEntryRepository } from "../fakes/in-memory-entry-repository";
import { InMemoryUsageLogRepository } from "../fakes/in-memory-usage-log-repository";

const TTL_MS = 15 * 60 * 1000;
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

function setUp() {
  const clock = new FakeClock(START);
  const usageLogRepository = new InMemoryUsageLogRepository();
  const source = {
    fetchTopEntries: async () => {
      clock.advance(CRAWL_DURATION_MS);

      return ENTRIES;
    },
  };
  const loader = new FreshEntriesLoader(
    new InMemoryEntryRepository(),
    source,
    clock.now,
    TTL_MS,
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
      },
      {
        timestamp: new Date(START.getTime() + CRAWL_DURATION_MS),
        appliedFilter: NO_FILTER,
        resultCount: ENTRIES.length,
        durationMs: 0,
        triggeredCrawl: false,
      },
    ]);
  });
});
