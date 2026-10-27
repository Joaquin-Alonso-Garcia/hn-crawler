import type {
  EntrySnapshot,
  FreshEntriesLoader,
} from "@/src/application/fresh-entries-loader";
import type { Entry } from "@/src/domain/entry";
import { EntrySourceError } from "@/src/domain/entry-source";
import { getFilterStrategy } from "@/src/domain/filters/filter-registry";
import {
  NO_FILTER,
  type AppliedFilter,
  type FilterType,
} from "@/src/domain/filters/filter-type";
import { UsageOutcome, type UsageLog } from "@/src/domain/usage-log";
import type { UsageLogRepository } from "@/src/domain/usage-log-repository";

type EntriesLoader = Pick<FreshEntriesLoader, "load">;
type UsageDetails = Omit<UsageLog, "timestamp" | "durationMs">;

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

// Source errors only happen while crawling, so they also mark the request as crawl-triggered.
function failureDetails(
  appliedFilter: AppliedFilter,
  error: unknown,
): UsageDetails {
  const isSourceFailure = error instanceof EntrySourceError;

  return {
    appliedFilter,
    resultCount: 0,
    triggeredCrawl: isSourceFailure,
    outcome: isSourceFailure
      ? UsageOutcome.SourceUnavailable
      : UsageOutcome.Error,
  };
}

export class GetEntriesUseCase {
  constructor(
    private readonly entriesLoader: EntriesLoader,
    private readonly usageLogRepository: UsageLogRepository,
    private readonly now: () => Date,
  ) {}

  async execute(filterType: FilterType | null): Promise<EntriesResult> {
    const startedAt = this.now();
    const appliedFilter = filterType ?? NO_FILTER;
    const snapshot = await this.loadRecordingFailures(startedAt, appliedFilter);
    const entries = applyFilter(snapshot.entries, filterType);

    await this.recordUsage(startedAt, {
      appliedFilter,
      resultCount: entries.length,
      triggeredCrawl: snapshot.crawled,
      outcome: UsageOutcome.Success,
    });

    return { entries, appliedFilter, crawledAt: snapshot.crawledAt };
  }

  private async loadRecordingFailures(
    startedAt: Date,
    appliedFilter: AppliedFilter,
  ): Promise<EntrySnapshot> {
    try {
      return await this.entriesLoader.load();
    } catch (error) {
      await this.recordUsage(startedAt, failureDetails(appliedFilter, error));
      throw error;
    }
  }

  private recordUsage(startedAt: Date, details: UsageDetails): Promise<void> {
    return this.usageLogRepository.record({
      ...details,
      timestamp: startedAt,
      durationMs: this.now().getTime() - startedAt.getTime(),
    });
  }
}
