import { EntriesDashboard } from "@/components/entries-dashboard";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">
          Hacker News Crawler
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
          The Hacker News front page, filtered by title length
        </h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          The top 30 stories, split by title length. Words are counted by
          spaces, ignoring standalone symbols.
        </p>
      </header>
      <EntriesDashboard />
    </main>
  );
}
