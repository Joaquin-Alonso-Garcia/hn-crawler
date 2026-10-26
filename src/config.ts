const MINUTE_MS = 60_000;

// Hacker News regenerates its logged-out front page about every 2 minutes (measured; undocumented),
// so crawling more often would only re-download identical HTML.
export const CRAWL_TTL_MS = 2 * MINUTE_MS;
