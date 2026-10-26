import { countWords } from "@/src/domain/word-count";

export const SHORT_TITLE_MAX_WORDS = 5;

export function isLongTitle(title: string): boolean {
  return countWords(title) > SHORT_TITLE_MAX_WORDS;
}

export function isShortTitle(title: string): boolean {
  return !isLongTitle(title);
}
