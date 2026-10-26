import type { Entry } from "@/src/domain/entry";
import type { EntryRepository } from "@/src/domain/entry-repository";

export class InMemoryEntryRepository implements EntryRepository {
  private entries: Entry[] = [];
  private lastCrawledAt: Date | null = null;

  async findAll(): Promise<Entry[]> {
    return [...this.entries].sort((first, second) => first.rank - second.rank);
  }

  async findLastCrawledAt(): Promise<Date | null> {
    return this.lastCrawledAt;
  }

  async replaceAll(entries: Entry[], crawledAt: Date): Promise<void> {
    this.entries = [...entries];
    this.lastCrawledAt = crawledAt;
  }
}
