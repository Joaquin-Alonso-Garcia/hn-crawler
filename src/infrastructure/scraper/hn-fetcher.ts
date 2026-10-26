export const HACKER_NEWS_URL = "https://news.ycombinator.com/";
const FETCH_TIMEOUT_MS = 10_000;

export async function fetchHackerNewsHtml(): Promise<string> {
  const response = await fetch(HACKER_NEWS_URL, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Hacker News responded with HTTP ${response.status}`);
  }

  return response.text();
}
