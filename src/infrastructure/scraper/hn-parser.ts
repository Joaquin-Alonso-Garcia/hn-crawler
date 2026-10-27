import { load, type Cheerio, type CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import type { Entry } from "@/src/domain/entry";

export const FRONT_PAGE_ENTRY_LIMIT = 30;

const STORY_ROW_SELECTOR = "tr.athing";
const COMMENTS_LINK_TEXT = /^\d+\s+comments?$/;
const FIRST_NUMBER = /\d+/;

function extractNumber(text: string): number {
  const match = FIRST_NUMBER.exec(text);

  return match ? Number(match[0]) : 0;
}

// The comments link is matched by its whole text: job postings have no such link,
// and other links can contain digits ("3 hours ago") or the word ("commenter42").
function findCommentsText($: CheerioAPI, subtext: Cheerio<Element>): string {
  return subtext
    .find("a")
    .filter((_, link) => COMMENTS_LINK_TEXT.test($(link).text().trim()))
    .first()
    .text();
}

function parseStoryRow($: CheerioAPI, row: Element): Entry {
  const storyRow = $(row);
  const subtext = storyRow.next().find(".subtext");

  return {
    rank: extractNumber(storyRow.find(".rank").text()),
    title: storyRow.find(".titleline > a").first().text().trim(),
    points: extractNumber(subtext.find(".score").text()),
    commentCount: extractNumber(findCommentsText($, subtext)),
  };
}

export function parseHackerNewsEntries(html: string): Entry[] {
  const $ = load(html);

  return $(STORY_ROW_SELECTOR)
    .toArray()
    .slice(0, FRONT_PAGE_ENTRY_LIMIT)
    .map((row) => parseStoryRow($, row));
}
