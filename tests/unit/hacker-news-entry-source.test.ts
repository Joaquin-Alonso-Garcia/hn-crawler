import { describe, expect, it } from "vitest";
import { EntrySourceError } from "@/src/domain/entry-source";
import { HackerNewsEntrySource } from "@/src/infrastructure/scraper/hacker-news-entry-source";
import { FRONT_PAGE_ENTRY_LIMIT } from "@/src/infrastructure/scraper/hn-parser";
import { FRONT_PAGE_HTML } from "../helpers/front-page-fixture";
import { stubFetchResponse } from "../helpers/stub-fetch";

describe("HackerNewsEntrySource", () => {
  const source = new HackerNewsEntrySource();

  it("fetches and parses the front page entries", async () => {
    stubFetchResponse(FRONT_PAGE_HTML, 200);

    const entries = await source.fetchTopEntries();

    expect(entries).toHaveLength(FRONT_PAGE_ENTRY_LIMIT);
    expect(entries[0].title).toBe("Dolly Parton's Imagination Library");
  });

  it("reports an unreachable Hacker News as an EntrySourceError", async () => {
    stubFetchResponse("Service Unavailable", 503);

    await expect(source.fetchTopEntries()).rejects.toBeInstanceOf(
      EntrySourceError,
    );
  });

  it("rejects a page without entries instead of returning an empty crawl", async () => {
    stubFetchResponse(
      "<html><body>We're down for maintenance</body></html>",
      200,
    );

    await expect(source.fetchTopEntries()).rejects.toThrow(
      new EntrySourceError("No entries found on the Hacker News front page"),
    );
  });
});
