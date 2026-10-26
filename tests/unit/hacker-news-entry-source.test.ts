import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EntrySourceError } from "@/src/domain/entry-source";
import { HackerNewsEntrySource } from "@/src/infrastructure/scraper/hacker-news-entry-source";

const fixtureHtml = readFileSync(
  new URL("../fixtures/hn-front-page.html", import.meta.url),
  "utf8",
);

function stubFetchResponse(body: string, status: number) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(body, { status })),
  );
}

describe("HackerNewsEntrySource", () => {
  const source = new HackerNewsEntrySource();

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches and parses the front page entries", async () => {
    stubFetchResponse(fixtureHtml, 200);

    const entries = await source.fetchTopEntries();

    expect(entries).toHaveLength(30);
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
