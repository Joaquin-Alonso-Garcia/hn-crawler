import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  FRONT_PAGE_ENTRY_LIMIT,
  parseHackerNewsEntries,
} from "@/src/infrastructure/scraper/hn-parser";

const fixtureHtml = readFileSync(
  new URL("../fixtures/hn-front-page.html", import.meta.url),
  "utf8",
);

function buildStoryRows(rank: number, title: string, subtext: string): string {
  return `
    <tr class="athing submission">
      <td class="title"><span class="rank">${rank}.</span></td>
      <td class="title"><span class="titleline"><a href="#">${title}</a></span></td>
    </tr>
    <tr><td class="subtext">${subtext}</td></tr>`;
}

function buildPage(rows: string[]): string {
  return `<table>${rows.join("")}</table>`;
}

describe("parseHackerNewsEntries", () => {
  describe("against a saved front page snapshot", () => {
    const entries = parseHackerNewsEntries(fixtureHtml);

    it("returns the 30 front page entries in rank order", () => {
      expect(entries).toHaveLength(FRONT_PAGE_ENTRY_LIMIT);
      expect(entries.map((entry) => entry.rank)).toEqual(
        Array.from({ length: FRONT_PAGE_ENTRY_LIMIT }, (_, index) => index + 1),
      );
    });

    it("extracts rank, title, points and comment count", () => {
      expect(entries[0]).toEqual({
        rank: 1,
        title: "Dolly Parton's Imagination Library",
        points: 362,
        commentCount: 65,
      });
    });

    it('reads "discuss" as zero comments', () => {
      expect(entries[13]).toMatchObject({ rank: 14, commentCount: 0 });
    });

    it('reads the singular "1 comment"', () => {
      expect(entries[18]).toMatchObject({ rank: 19, commentCount: 1 });
    });
  });

  it("reads a job posting without score or comments as zero, ignoring its age link", () => {
    const html = buildPage([
      buildStoryRows(
        1,
        "Acme (YC W26) is hiring",
        '<span class="age"><a href="item?id=1">3 hours ago</a></span>',
      ),
    ]);

    expect(parseHackerNewsEntries(html)).toEqual([
      { rank: 1, title: "Acme (YC W26) is hiring", points: 0, commentCount: 0 },
    ]);
  });

  it('ignores an author whose username contains "comment"', () => {
    const html = buildPage([
      buildStoryRows(
        1,
        "Some story",
        `<span class="score">120 points</span>
         by <a href="user?id=commenter42" class="hnuser">commenter42</a>
         | <a href="item?id=1">65&nbsp;comments</a>`,
      ),
    ]);

    expect(parseHackerNewsEntries(html)).toEqual([
      { rank: 1, title: "Some story", points: 120, commentCount: 65 },
    ]);
  });

  it("keeps only the first 30 entries", () => {
    const rows = Array.from(
      { length: FRONT_PAGE_ENTRY_LIMIT + 1 },
      (_, index) => buildStoryRows(index + 1, `Story ${index + 1}`, ""),
    );

    expect(parseHackerNewsEntries(buildPage(rows))).toHaveLength(
      FRONT_PAGE_ENTRY_LIMIT,
    );
  });

  it("returns no entries for a page without stories", () => {
    expect(
      parseHackerNewsEntries("<html><body>Maintenance</body></html>"),
    ).toEqual([]);
  });
});
