const SKELETON_ROW_COUNT = 8;

export function EntryTableSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading stories"
      className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
    >
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <div
          key={index}
          className="h-6 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800"
        />
      ))}
    </div>
  );
}
