import type { Entry } from "@/src/domain/entry";

export interface EntrySource {
  fetchTopEntries(): Promise<Entry[]>;
}

export class EntrySourceError extends Error {
  override readonly name = "EntrySourceError";
}
