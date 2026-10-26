import { describe, expect, it } from "vitest";
import type { Entry } from "@/src/domain/entry";
import { LongTitlesByCommentsFilter } from "@/src/domain/filters/long-titles-by-comments-filter";
import { ShortTitlesByPointsFilter } from "@/src/domain/filters/short-titles-by-points-filter";

function buildEntry(
  rank: number,
  title: string,
  points: number,
  commentCount: number,
): Entry {
  return { rank, title, points, commentCount };
}

const challengeExample = buildEntry(
  1,
  "This is - a self-explained example",
  50,
  10,
);
const sixWords = buildEntry(2, "One two three four five six", 20, 40);
const exactlyFiveWords = buildEntry(3, "Exactly five words right here", 80, 5);
const eightWords = buildEntry(
  4,
  "A much longer title with many more words",
  10,
  90,
);
const twoWords = buildEntry(5, "Short one", 50, 1);
const sevenWordsTiedComments = buildEntry(
  6,
  "Another long title that ties on comments",
  5,
  40,
);

const entries = [
  challengeExample,
  sixWords,
  exactlyFiveWords,
  eightWords,
  twoWords,
  sevenWordsTiedComments,
];

describe("LongTitlesByCommentsFilter", () => {
  const filter = new LongTitlesByCommentsFilter();

  it("keeps titles with more than five words, by comments descending, ties in rank order", () => {
    expect(filter.apply(entries)).toEqual([
      eightWords,
      sixWords,
      sevenWordsTiedComments,
    ]);
  });
});

describe("ShortTitlesByPointsFilter", () => {
  const filter = new ShortTitlesByPointsFilter();

  it("keeps titles with five or fewer words, by points descending, ties in rank order", () => {
    expect(filter.apply(entries)).toEqual([
      exactlyFiveWords,
      challengeExample,
      twoWords,
    ]);
  });
});

describe("both filters together", () => {
  it("place every entry in exactly one filter", () => {
    const longTitles = new LongTitlesByCommentsFilter().apply(entries);
    const shortTitles = new ShortTitlesByPointsFilter().apply(entries);

    expect([...longTitles, ...shortTitles]).toHaveLength(entries.length);
    expect(new Set([...longTitles, ...shortTitles])).toEqual(new Set(entries));
  });
});
