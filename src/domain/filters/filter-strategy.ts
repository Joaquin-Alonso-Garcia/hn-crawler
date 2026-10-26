import type { Entry } from "@/src/domain/entry";

export interface FilterStrategy {
  apply(entries: readonly Entry[]): Entry[];
}
