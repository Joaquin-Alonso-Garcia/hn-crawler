const WHITESPACE = /\s+/;
const LETTER_OR_DIGIT = /[\p{L}\p{N}]/u;

function isWord(token: string): boolean {
  return LETTER_OR_DIGIT.test(token);
}

export function countWords(text: string): number {
  const words = text.split(WHITESPACE).filter(isWord);

  return words.length;
}
