import type { AppliedFilter } from "@/src/domain/filters/filter-type";

export interface UsageLog {
  timestamp: Date;
  appliedFilter: AppliedFilter;
  resultCount: number;
  durationMs: number;
  triggeredCrawl: boolean;
}
