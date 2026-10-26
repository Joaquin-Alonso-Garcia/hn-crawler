import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HackerNewsEntrySource } from "@/src/infrastructure/scraper/hacker-news-entry-source";

const fixtureHtml = readFileSync(
  new URL("../fixtures/hn-front-page.html", import.meta.url),
  "utf8",
);

function stubFetchBody(body: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(body, { status: 200 })),
  );
}

describe("HackerNewsEntrySource", () => {
  const source = new HackerNewsEntrySource();

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches and parses the front page entries", async () => {
    stubFetchBody(fixtureHtml);

    const entries = await source.fetchTopEntries();

    expect(entries).toHaveLength(30);
    expect(entries[0].title).toBe("Dolly Parton's Imagination Library");
  });

  it("rejects a page without entries instead of returning an empty crawl", async () => {
    stubFetchBody("<html><body>We're down for maintenance</body></html>");

    await expect(source.fetchTopEntries()).rejects.toThrow("No entries found");
  });
});
