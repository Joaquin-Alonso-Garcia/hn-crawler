import type { SortField } from "@/components/filter-options";
import type { Entry } from "@/src/domain/entry";
import { countWords } from "@/src/domain/word-count";

interface EntryTableProps {
  entries: Entry[];
  sortedBy: SortField;
}

interface NumericColumn {
  field: Extract<SortField, "points" | "commentCount">;
  label: string;
}

const NUMERIC_COLUMNS: readonly NumericColumn[] = [
  { field: "points", label: "Points" },
  { field: "commentCount", label: "Comments" },
];

const CELL = "px-2 py-2 sm:px-3";
const HEADER_CELL = `${CELL} text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400`;
const NUMBER_CELL = `${CELL} text-right tabular-nums`;
const WIDE_SCREEN_ONLY = "hidden sm:table-cell";

function sortedHeaderClass(isSorted: boolean): string {
  return isSorted ? "text-accent" : "";
}

function EntryRow({ entry }: { entry: Entry }) {
  const wordCount = countWords(entry.title);

  return (
    <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
      <td className={`${NUMBER_CELL} text-zinc-400`}>{entry.rank}</td>
      <td className={`${CELL} font-medium text-zinc-900 dark:text-zinc-100`}>
        {entry.title}
        <span className="block text-xs font-normal text-zinc-500 sm:hidden">
          {wordCount} words
        </span>
      </td>
      <td className={`${NUMBER_CELL} ${WIDE_SCREEN_ONLY} text-zinc-500`}>
        {wordCount}
      </td>
      {NUMERIC_COLUMNS.map((column) => (
        <td key={column.field} className={NUMBER_CELL}>
          {entry[column.field]}
        </td>
      ))}
    </tr>
  );
}

export function EntryTable({ entries, sortedBy }: EntryTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">Hacker News front page entries</caption>
        <thead className="bg-zinc-50 dark:bg-zinc-900">
          <tr>
            <th
              scope="col"
              aria-sort={sortedBy === "rank" ? "ascending" : undefined}
              className={`${HEADER_CELL} text-right ${sortedHeaderClass(sortedBy === "rank")}`}
            >
              #
            </th>
            <th scope="col" className={`${HEADER_CELL} text-left`}>
              Title
            </th>
            <th
              scope="col"
              className={`${HEADER_CELL} ${WIDE_SCREEN_ONLY} text-right`}
            >
              Words
            </th>
            {NUMERIC_COLUMNS.map((column) => (
              <th
                key={column.field}
                scope="col"
                aria-sort={sortedBy === column.field ? "descending" : undefined}
                className={`${HEADER_CELL} text-right ${sortedHeaderClass(sortedBy === column.field)}`}
              >
                {column.label}
                {sortedBy === column.field && <span aria-hidden> ↓</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {entries.map((entry) => (
            <EntryRow key={entry.rank} entry={entry} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
