import {
  FilterType,
  NO_FILTER,
  type AppliedFilter,
} from "@/src/domain/filters/filter-type";
import { SHORT_TITLE_MAX_WORDS } from "@/src/domain/filters/title-length";

export type SortField = "rank" | "points" | "commentCount";

export interface FilterOption {
  value: FilterType | null;
  label: string;
  description: string;
  sortedBy: SortField;
}

export const FILTER_OPTIONS: readonly FilterOption[] = [
  {
    value: null,
    label: "All stories",
    description: "Front page order",
    sortedBy: "rank",
  },
  {
    value: FilterType.LongTitles,
    label: "Long titles",
    description: `More than ${SHORT_TITLE_MAX_WORDS} words · most comments first`,
    sortedBy: "commentCount",
  },
  {
    value: FilterType.ShortTitles,
    label: "Short titles",
    description: `${SHORT_TITLE_MAX_WORDS} words or fewer · most points first`,
    sortedBy: "points",
  },
];

export function sortFieldFor(appliedFilter: AppliedFilter): SortField {
  const filter = appliedFilter === NO_FILTER ? null : appliedFilter;
  const option = FILTER_OPTIONS.find((candidate) => candidate.value === filter);

  return option?.sortedBy ?? "rank";
}
