import type { Entry } from "@/src/domain/entry";
import type {
  AppliedFilter,
  FilterType,
} from "@/src/domain/filters/filter-type";

export interface EntriesResponse {
  entries: Entry[];
  appliedFilter: AppliedFilter;
  crawledAt: string;
}

const ENTRIES_ENDPOINT = "/api/entries";

export function entriesUrl(filter: FilterType | null): string {
  if (filter === null) {
    return ENTRIES_ENDPOINT;
  }

  return `${ENTRIES_ENDPOINT}?${new URLSearchParams({ filter })}`;
}

function hasErrorMessage(body: unknown): body is { error: string } {
  return (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
  );
}

async function readErrorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);

  if (hasErrorMessage(body)) {
    return body.error;
  }

  return `Request failed with HTTP ${response.status}`;
}

export async function fetchEntries(url: string): Promise<EntriesResponse> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json();
}
