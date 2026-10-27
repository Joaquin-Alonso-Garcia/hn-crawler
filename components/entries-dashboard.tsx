"use client";

import { useState } from "react";
import useSWR from "swr";
import { CrawlStatus } from "@/components/crawl-status";
import { EntryTable } from "@/components/entry-table";
import { EntryTableSkeleton } from "@/components/entry-table-skeleton";
import { ErrorBanner } from "@/components/error-banner";
import { FilterControls } from "@/components/filter-controls";
import { FILTER_OPTIONS, sortFieldFor } from "@/components/filter-options";
import {
  entriesUrl,
  fetchEntries,
  type EntriesResponse,
} from "@/lib/entries-api";
import { NO_FILTER, type FilterType } from "@/src/domain/filters/filter-type";

interface EntriesResultsProps {
  response: EntriesResponse;
  isStale: boolean;
  isUpdating: boolean;
}

function EntriesResults({
  response,
  isStale,
  isUpdating,
}: EntriesResultsProps) {
  return (
    <div className="flex flex-col gap-3">
      <CrawlStatus
        entryCount={response.entries.length}
        crawledAt={response.crawledAt}
        isUpdating={isUpdating}
      />
      <div
        aria-busy={isStale}
        className={`transition-opacity ${isStale ? "opacity-50" : ""}`}
      >
        {response.entries.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            No stories match this filter right now.
          </p>
        ) : (
          <EntryTable
            entries={response.entries}
            sortedBy={sortFieldFor(response.appliedFilter)}
          />
        )}
      </div>
    </div>
  );
}

export function EntriesDashboard() {
  const [filter, setFilter] = useState<FilterType | null>(null);
  const { data, error, isValidating, mutate } = useSWR(
    entriesUrl(filter),
    fetchEntries,
    { keepPreviousData: true },
  );
  const isShowingPreviousFilter =
    data !== undefined && data.appliedFilter !== (filter ?? NO_FILTER);

  return (
    <section className="flex flex-col gap-6">
      <FilterControls
        options={FILTER_OPTIONS}
        selected={filter}
        onSelect={setFilter}
      />
      {error && (
        <ErrorBanner message={error.message} onRetry={() => mutate()} />
      )}
      {data && (
        <EntriesResults
          response={data}
          isStale={isShowingPreviousFilter}
          isUpdating={isValidating}
        />
      )}
      {!data && !error && <EntryTableSkeleton />}
    </section>
  );
}
