import { describe, expect, it } from "vitest";
import { getFilterStrategy } from "@/src/domain/filters/filter-registry";
import { FilterType, isFilterType } from "@/src/domain/filters/filter-type";
import { LongTitlesByCommentsFilter } from "@/src/domain/filters/long-titles-by-comments-filter";
import { ShortTitlesByPointsFilter } from "@/src/domain/filters/short-titles-by-points-filter";

describe("getFilterStrategy", () => {
  it.each([
    [FilterType.LongTitles, LongTitlesByCommentsFilter],
    [FilterType.ShortTitles, ShortTitlesByPointsFilter],
  ])("maps %s to its strategy", (filterType, strategyClass) => {
    expect(getFilterStrategy(filterType)).toBeInstanceOf(strategyClass);
  });
});

describe("isFilterType", () => {
  it.each(["long-titles", "short-titles"])("accepts %s", (value) => {
    expect(isFilterType(value)).toBe(true);
  });

  it.each(["none", "", "LONG-TITLES", "long_titles"])("rejects %j", (value) => {
    expect(isFilterType(value)).toBe(false);
  });
});
