import type { Entry } from "@/src/domain/entry";
import type { EntrySource } from "@/src/domain/entry-source";
import { fetchHackerNewsHtml } from "@/src/infrastructure/scraper/hn-fetcher";
import { parseHackerNewsEntries } from "@/src/infrastructure/scraper/hn-parser";

export class HackerNewsEntrySource implements EntrySource {
  async fetchTopEntries(): Promise<Entry[]> {
    const entries = parseHackerNewsEntries(await fetchHackerNewsHtml());

    if (entries.length === 0) {
      throw new Error("No entries found on the Hacker News front page");
    }

    return entries;
  }
}
