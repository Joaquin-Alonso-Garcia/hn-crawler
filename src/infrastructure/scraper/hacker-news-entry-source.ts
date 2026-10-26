import type { Entry } from "@/src/domain/entry";
import { EntrySourceError, type EntrySource } from "@/src/domain/entry-source";
import { fetchHackerNewsHtml } from "@/src/infrastructure/scraper/hn-fetcher";
import { parseHackerNewsEntries } from "@/src/infrastructure/scraper/hn-parser";

export class HackerNewsEntrySource implements EntrySource {
  async fetchTopEntries(): Promise<Entry[]> {
    const entries = parseHackerNewsEntries(await this.fetchHtml());

    if (entries.length === 0) {
      throw new EntrySourceError(
        "No entries found on the Hacker News front page",
      );
    }

    return entries;
  }

  private async fetchHtml(): Promise<string> {
    try {
      return await fetchHackerNewsHtml();
    } catch (cause) {
      throw new EntrySourceError("Could not fetch the Hacker News front page", {
        cause,
      });
    }
  }
}
