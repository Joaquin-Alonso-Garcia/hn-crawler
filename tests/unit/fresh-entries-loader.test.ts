import { describe, expect, it, vi } from "vitest";
import { FreshEntriesLoader } from "@/src/application/fresh-entries-loader";
import type { Entry } from "@/src/domain/entry";
import { FakeClock } from "../fakes/fake-clock";
import { InMemoryEntryRepository } from "../fakes/in-memory-entry-repository";

const TTL_MS = 15 * 60 * 1000;
const START = new Date("2026-10-26T10:00:00.000Z");
const STORED_ENTRIES: Entry[] = [
  { rank: 1, title: "Stored story", points: 10, commentCount: 1 },
];
const CRAWLED_ENTRIES: Entry[] = [
  { rank: 1, title: "Fresh story", points: 20, commentCount: 2 },
  { rank: 2, title: "Another fresh story", points: 30, commentCount: 3 },
];

function setUp() {
  const clock = new FakeClock(START);
  const repository = new InMemoryEntryRepository();
  const source = {
    fetchTopEntries: vi
      .fn<() => Promise<Entry[]>>()
      .mockResolvedValue(CRAWLED_ENTRIES),
  };
  const loader = new FreshEntriesLoader(repository, source, clock.now, TTL_MS);

  return { clock, repository, source, loader };
}

describe("FreshEntriesLoader", () => {
  it("crawls when nothing has been stored yet", async () => {
    const { loader, source } = setUp();

    await expect(loader.load()).resolves.toEqual({
      entries: CRAWLED_ENTRIES,
      crawledAt: START,
      crawled: true,
    });
    expect(source.fetchTopEntries).toHaveBeenCalledOnce();
  });

  it("serves stored entries without crawling while within the TTL", async () => {
    const { loader, source, repository, clock } = setUp();
    await repository.replaceAll(STORED_ENTRIES, START);
    clock.advance(TTL_MS - 1);

    await expect(loader.load()).resolves.toEqual({
      entries: STORED_ENTRIES,
      crawledAt: START,
      crawled: false,
    });
    expect(source.fetchTopEntries).not.toHaveBeenCalled();
  });

  it("re-crawls once the TTL has elapsed", async () => {
    const { loader, repository, clock } = setUp();
    await repository.replaceAll(STORED_ENTRIES, START);
    clock.advance(TTL_MS);

    await expect(loader.load()).resolves.toEqual({
      entries: CRAWLED_ENTRIES,
      crawledAt: clock.now(),
      crawled: true,
    });
  });

  it("shares one crawl between concurrent requests", async () => {
    const { loader, source } = setUp();
    const pendingFetch = Promise.withResolvers<Entry[]>();
    source.fetchTopEntries.mockReturnValue(pendingFetch.promise);

    const firstLoad = loader.load();
    const secondLoad = loader.load();
    pendingFetch.resolve(CRAWLED_ENTRIES);

    const [first, second] = await Promise.all([firstLoad, secondLoad]);
    expect(first.entries).toEqual(CRAWLED_ENTRIES);
    expect(second.entries).toEqual(CRAWLED_ENTRIES);
    expect(source.fetchTopEntries).toHaveBeenCalledOnce();
  });

  it("keeps stored entries when a crawl fails and retries on the next request", async () => {
    const { loader, source, repository, clock } = setUp();
    await repository.replaceAll(STORED_ENTRIES, START);
    clock.advance(TTL_MS);
    source.fetchTopEntries.mockRejectedValueOnce(new Error("HTTP 503"));

    await expect(loader.load()).rejects.toThrow("HTTP 503");
    await expect(repository.findAll()).resolves.toEqual(STORED_ENTRIES);

    await expect(loader.load()).resolves.toMatchObject({
      entries: CRAWLED_ENTRIES,
      crawled: true,
    });
  });
});
