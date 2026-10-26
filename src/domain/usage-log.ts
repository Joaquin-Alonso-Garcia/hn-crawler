export interface UsageLog {
  timestamp: Date;
  appliedFilter: string;
  resultCount: number;
  durationMs: number;
  triggeredCrawl: boolean;
}
