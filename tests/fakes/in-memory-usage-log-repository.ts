import type { UsageLog } from "@/src/domain/usage-log";
import type { UsageLogRepository } from "@/src/domain/usage-log-repository";

export class InMemoryUsageLogRepository implements UsageLogRepository {
  readonly logs: UsageLog[] = [];

  async record(log: UsageLog): Promise<void> {
    this.logs.push(log);
  }
}
