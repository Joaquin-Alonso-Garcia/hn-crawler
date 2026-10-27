import type { FreshEntriesLoader } from "@/src/application/fresh-entries-loader";
import type { Entry } from "@/src/domain/entry";
import { getFilterStrategy } from "@/src/domain/filters/filter-registry";
import {
  NO_FILTER,
  type AppliedFilter,
  type FilterType,
} from "@/src/domain/filters/filter-type";
import type { UsageLogRepository } from "@/src/domain/usage-log-repository";

type EntriesLoader = Pick<FreshEntriesLoader, "load">;

export interface EntriesResult {
  entries: Entry[];
  appliedFilter: AppliedFilter;
  crawledAt: Date;
}

function applyFilter(entries: Entry[], filterType: FilterType | null): Entry[] {
  if (filterType === null) {
    return entries;
  }

  return getFilterStrategy(filterType).apply(entries);
}

export class GetEntriesUseCase {
  constructor(
    private readonly entriesLoader: EntriesLoader,
    private readonly usageLogRepository: UsageLogRepository,
    private readonly now: () => Date,
  ) {}

  async execute(filterType: FilterType | null): Promise<EntriesResult> {
    const startedAt = this.now();
    const snapshot = await this.entriesLoader.load();
    const entries = applyFilter(snapshot.entries, filterType);
    const appliedFilter = filterType ?? NO_FILTER;

    await this.usageLogRepository.record({
      timestamp: startedAt,
      appliedFilter,
      resultCount: entries.length,
      durationMs: this.now().getTime() - startedAt.getTime(),
      triggeredCrawl: snapshot.crawled,
    });

    return { entries, appliedFilter, crawledAt: snapshot.crawledAt };
  }
}
