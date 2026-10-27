import { getFilterStrategy } from "@/src/domain/filters/filter-registry";
import {
  FilterType,
  NO_FILTER,
  type AppliedFilter,
} from "@/src/domain/filters/filter-type";
import { SHORT_TITLE_MAX_WORDS } from "@/src/domain/filters/title-length";
import type { RankingField } from "@/src/domain/filters/sort-descending";

export type SortField = "rank" | RankingField;

export interface FilterOption {
  value: FilterType | null;
  label: string;
  description: string;
}

type FilterLabel = Omit<FilterOption, "value">;

const ALL_STORIES: FilterOption = {
  value: null,
  label: "All stories",
  description: "Front page order",
};

const FILTER_LABELS: Record<FilterType, FilterLabel> = {
  [FilterType.LongTitles]: {
    label: "Long titles",
    description: `More than ${SHORT_TITLE_MAX_WORDS} words · most comments first`,
  },
  [FilterType.ShortTitles]: {
    label: "Short titles",
    description: `${SHORT_TITLE_MAX_WORDS} words or fewer · most points first`,
  },
};

export const FILTER_OPTIONS: readonly FilterOption[] = [
  ALL_STORIES,
  ...Object.values(FilterType).map((value) => ({
    value,
    ...FILTER_LABELS[value],
  })),
];

export function sortFieldFor(appliedFilter: AppliedFilter): SortField {
  if (appliedFilter === NO_FILTER) {
    return "rank";
  }

  return getFilterStrategy(appliedFilter).sortField;
}
