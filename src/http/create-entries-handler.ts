import type { NextRequest } from "next/server";
import type { GetEntriesUseCase } from "@/src/application/get-entries-use-case";
import { EntrySourceError } from "@/src/domain/entry-source";
import { FilterType, isFilterType } from "@/src/domain/filters/filter-type";

type EntriesQuery = Pick<GetEntriesUseCase, "execute">;

const FILTER_PARAM = "filter";
const HTTP_BAD_REQUEST = 400;
const HTTP_INTERNAL_SERVER_ERROR = 500;
const HTTP_BAD_GATEWAY = 502;

function unknownFilterResponse(filter: string): Response {
  return Response.json(
    {
      error: `Unknown filter "${filter}"`,
      allowedFilters: Object.values(FilterType),
    },
    { status: HTTP_BAD_REQUEST },
  );
}

function failureResponse(error: unknown): Response {
  console.error("Failed to load entries", error);

  if (error instanceof EntrySourceError) {
    return Response.json(
      { error: "Hacker News is unavailable right now" },
      { status: HTTP_BAD_GATEWAY },
    );
  }

  return Response.json(
    { error: "Unexpected error while loading entries" },
    { status: HTTP_INTERNAL_SERVER_ERROR },
  );
}

export function createEntriesHandler(getEntriesQuery: () => EntriesQuery) {
  return async function GET(request: NextRequest): Promise<Response> {
    const filter = request.nextUrl.searchParams.get(FILTER_PARAM);

    if (filter !== null && !isFilterType(filter)) {
      return unknownFilterResponse(filter);
    }

    try {
      return Response.json(await getEntriesQuery().execute(filter));
    } catch (error) {
      return failureResponse(error);
    }
  };
}
