import type { FilterType } from "@/src/domain/filters/filter-type";
import type { FilterOption } from "@/components/filter-options";

interface FilterControlsProps {
  options: readonly FilterOption[];
  selected: FilterType | null;
  onSelect: (filter: FilterType | null) => void;
}

const BASE_BUTTON =
  "flex flex-col items-start gap-0.5 rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const SELECTED_BUTTON =
  "border-accent bg-accent/10 text-zinc-950 dark:text-zinc-50";
const IDLE_BUTTON =
  "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800";

export function FilterControls({
  options,
  selected,
  onSelect,
}: FilterControlsProps) {
  return (
    <div
      role="group"
      aria-label="Filter stories"
      className="grid grid-cols-1 gap-2 sm:grid-cols-3"
    >
      {options.map((option) => {
        const isSelected = option.value === selected;

        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(option.value)}
            className={`${BASE_BUTTON} ${isSelected ? SELECTED_BUTTON : IDLE_BUTTON}`}
          >
            <span className="text-sm font-semibold">{option.label}</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {option.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
