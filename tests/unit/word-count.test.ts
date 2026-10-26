import { describe, expect, it } from "vitest";
import { countWords } from "@/src/domain/word-count";

describe("countWords", () => {
  it("matches the challenge example", () => {
    expect(countWords("This is - a self-explained example")).toBe(5);
  });

  it.each([
    [
      "hyphenated compounds count as one word",
      "A well-known open-source tool",
      4,
    ],
    ["standalone symbols are excluded", "Rust | Go & Zig — compared", 4],
    [
      "punctuation attached to a word keeps the word",
      "Show HN: My project (2026)",
      5,
    ],
    ["numbers count as words", "Top 10 tips for 2026", 5],
    [
      "repeated and surrounding whitespace is ignored",
      "  Hello    world \t again \n",
      3,
    ],
    ["non-ASCII letters count as words", "Café über naïve 日本語", 4],
  ])("%s", (_rule, title, expected) => {
    expect(countWords(title)).toBe(expected);
  });

  it.each([
    ["an empty title", ""],
    ["a whitespace-only title", "   \t  "],
    ["a symbols-only title", "-- | ** --"],
  ])("returns 0 for %s", (_case, title) => {
    expect(countWords(title)).toBe(0);
  });
});
