import type { Entry } from "@/src/domain/entry";
import type { FilterStrategy } from "@/src/domain/filters/filter-strategy";
import { byDescending } from "@/src/domain/filters/sort-descending";
import { isShortTitle } from "@/src/domain/filters/title-length";

export class ShortTitlesByPointsFilter implements FilterStrategy {
  readonly sortField = "points";

  apply(entries: readonly Entry[]): Entry[] {
    return entries
      .filter((entry) => isShortTitle(entry.title))
      .sort(byDescending(this.sortField));
  }
}
