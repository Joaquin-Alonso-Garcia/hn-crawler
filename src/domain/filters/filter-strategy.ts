import type { Entry } from "@/src/domain/entry";
import type { RankingField } from "@/src/domain/filters/sort-descending";

export interface FilterStrategy {
  readonly sortField: RankingField;
  apply(entries: readonly Entry[]): Entry[];
}
