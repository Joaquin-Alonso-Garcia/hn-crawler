import { describe, expect, it } from "vitest";
import { getFilterStrategy } from "@/src/domain/filters/filter-registry";
import { FilterType, isFilterType } from "@/src/domain/filters/filter-type";
import { LongTitlesByCommentsFilter } from "@/src/domain/filters/long-titles-by-comments-filter";
import { ShortTitlesByPointsFilter } from "@/src/domain/filters/short-titles-by-points-filter";

describe("getFilterStrategy", () => {
  it.each([
    [FilterType.LongTitles, LongTitlesByCommentsFilter, "commentCount"],
    [FilterType.ShortTitles, ShortTitlesByPointsFilter, "points"],
  ])(
    "maps %s to its strategy and sort field",
    (filterType, strategyClass, sortField) => {
      const strategy = getFilterStrategy(filterType);

      expect(strategy).toBeInstanceOf(strategyClass);
      expect(strategy.sortField).toBe(sortField);
    },
  );
});

describe("isFilterType", () => {
  it.each(["long-titles", "short-titles"])("accepts %s", (value) => {
    expect(isFilterType(value)).toBe(true);
  });

  it.each(["none", "", "LONG-TITLES", "long_titles"])("rejects %j", (value) => {
    expect(isFilterType(value)).toBe(false);
  });
});
