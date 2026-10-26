export const FilterType = {
  LongTitles: "long-titles",
  ShortTitles: "short-titles",
} as const;

export type FilterType = (typeof FilterType)[keyof typeof FilterType];

export const NO_FILTER = "none";

export type AppliedFilter = FilterType | typeof NO_FILTER;

const FILTER_TYPES: readonly string[] = Object.values(FilterType);

export function isFilterType(value: string): value is FilterType {
  return FILTER_TYPES.includes(value);
}
