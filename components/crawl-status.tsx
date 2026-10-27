interface CrawlStatusProps {
  entryCount: number;
  crawledAt: string;
  isUpdating: boolean;
}

function formatTime(isoTimestamp: string): string {
  return new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(
    new Date(isoTimestamp),
  );
}

export function CrawlStatus({
  entryCount,
  crawledAt,
  isUpdating,
}: CrawlStatusProps) {
  return (
    <p
      aria-live="polite"
      className="flex flex-wrap items-center gap-x-2 text-sm text-zinc-500 dark:text-zinc-400"
    >
      <span className="font-medium text-zinc-700 dark:text-zinc-300">
        {entryCount} {entryCount === 1 ? "story" : "stories"}
      </span>
      <span aria-hidden>·</span>
      <span>
        Hacker News snapshot from{" "}
        <time dateTime={crawledAt}>{formatTime(crawledAt)}</time>
      </span>
      {isUpdating && <span className="text-accent">Updating…</span>}
    </p>
  );
}
