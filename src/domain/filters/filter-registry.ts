import type { FilterStrategy } from "@/src/domain/filters/filter-strategy";
import { FilterType } from "@/src/domain/filters/filter-type";
import { LongTitlesByCommentsFilter } from "@/src/domain/filters/long-titles-by-comments-filter";
import { ShortTitlesByPointsFilter } from "@/src/domain/filters/short-titles-by-points-filter";

const FILTER_STRATEGIES: Record<FilterType, FilterStrategy> = {
  [FilterType.LongTitles]: new LongTitlesByCommentsFilter(),
  [FilterType.ShortTitles]: new ShortTitlesByPointsFilter(),
};

export function getFilterStrategy(filterType: FilterType): FilterStrategy {
  return FILTER_STRATEGIES[filterType];
}
