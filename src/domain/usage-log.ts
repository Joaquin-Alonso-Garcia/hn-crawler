import type { AppliedFilter } from "@/src/domain/filters/filter-type";

export const UsageOutcome = {
  Success: "success",
  SourceUnavailable: "source-unavailable",
  Error: "error",
} as const;

export type UsageOutcome = (typeof UsageOutcome)[keyof typeof UsageOutcome];

export interface UsageLog {
  timestamp: Date;
  appliedFilter: AppliedFilter;
  resultCount: number;
  durationMs: number;
  triggeredCrawl: boolean;
  outcome: UsageOutcome;
}
