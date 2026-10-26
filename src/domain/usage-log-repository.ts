import type { UsageLog } from "@/src/domain/usage-log";

export interface UsageLogRepository {
  record(log: UsageLog): Promise<void>;
}
