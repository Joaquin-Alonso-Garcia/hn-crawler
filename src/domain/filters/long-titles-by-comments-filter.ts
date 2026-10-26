import type { Entry } from "@/src/domain/entry";
import type { FilterStrategy } from "@/src/domain/filters/filter-strategy";
import { byDescending } from "@/src/domain/filters/sort-descending";
import { isLongTitle } from "@/src/domain/filters/title-length";

export class LongTitlesByCommentsFilter implements FilterStrategy {
  apply(entries: readonly Entry[]): Entry[] {
    return entries
      .filter((entry) => isLongTitle(entry.title))
      .sort(byDescending("commentCount"));
  }
}
