import type { Entry } from "@/src/domain/entry";

export type RankingField = "points" | "commentCount";

export function byDescending(
  field: RankingField,
): (first: Entry, second: Entry) => number {
  return (first, second) => second[field] - first[field];
}
