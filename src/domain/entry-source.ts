import type { Entry } from "@/src/domain/entry";

export interface EntrySource {
  fetchTopEntries(): Promise<Entry[]>;
}
