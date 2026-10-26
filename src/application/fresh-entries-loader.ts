import type { Entry } from "@/src/domain/entry";
import type { EntryRepository } from "@/src/domain/entry-repository";
import type { EntrySource } from "@/src/domain/entry-source";

export interface EntrySnapshot {
  entries: Entry[];
  crawledAt: Date;
  crawled: boolean;
}

export class FreshEntriesLoader {
  // Concurrent requests that find stale data share one crawl instead of each hitting Hacker News.
  private pendingCrawl: Promise<Date> | null = null;

  constructor(
    private readonly entryRepository: EntryRepository,
    private readonly entrySource: EntrySource,
    private readonly now: () => Date,
    private readonly ttlMs: number,
  ) {}

  async load(): Promise<EntrySnapshot> {
    const lastCrawledAt = await this.entryRepository.findLastCrawledAt();
    const isFresh = lastCrawledAt !== null && this.isWithinTtl(lastCrawledAt);
    const crawledAt = isFresh ? lastCrawledAt : await this.crawlOnce();
    const entries = await this.entryRepository.findAll();

    return { entries, crawledAt, crawled: !isFresh };
  }

  private isWithinTtl(crawledAt: Date): boolean {
    return this.now().getTime() - crawledAt.getTime() < this.ttlMs;
  }

  private crawlOnce(): Promise<Date> {
    this.pendingCrawl ??= this.crawl().finally(() => {
      this.pendingCrawl = null;
    });

    return this.pendingCrawl;
  }

  private async crawl(): Promise<Date> {
    const entries = await this.entrySource.fetchTopEntries();
    const crawledAt = this.now();
    await this.entryRepository.replaceAll(entries, crawledAt);

    return crawledAt;
  }
}
