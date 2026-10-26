import type { Entry } from "@/src/domain/entry";

export interface EntryRepository {
  findAll(): Promise<Entry[]>;
  findLastCrawledAt(): Promise<Date | null>;
  replaceAll(entries: Entry[], crawledAt: Date): Promise<void>;
}
