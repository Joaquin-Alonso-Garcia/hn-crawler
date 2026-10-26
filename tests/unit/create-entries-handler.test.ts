import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EntriesResult } from "@/src/application/get-entries-use-case";
import { EntrySourceError } from "@/src/domain/entry-source";
import { FilterType, NO_FILTER } from "@/src/domain/filters/filter-type";
import { createEntriesHandler } from "@/src/http/create-entries-handler";

const RESULT: EntriesResult = {
  entries: [{ rank: 1, title: "Story", points: 10, commentCount: 2 }],
  appliedFilter: NO_FILTER,
  crawledAt: new Date("2026-10-26T10:00:00.000Z"),
};

function setUp() {
  const execute = vi
    .fn<(filter: FilterType | null) => Promise<EntriesResult>>()
    .mockResolvedValue(RESULT);
  const handler = createEntriesHandler(() => ({ execute }));
  const request = (query = "") =>
    handler(new NextRequest(`http://localhost/api/entries${query}`));

  return { execute, request };
}

describe("GET /api/entries", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns all entries as JSON when no filter is given", async () => {
    const { execute, request } = setUp();

    const response = await request();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ...RESULT,
      crawledAt: "2026-10-26T10:00:00.000Z",
    });
    expect(execute).toHaveBeenCalledWith(null);
  });

  it("passes a known filter to the use case", async () => {
    const { execute, request } = setUp();

    await request("?filter=long-titles");

    expect(execute).toHaveBeenCalledWith(FilterType.LongTitles);
  });

  it("rejects an unknown filter with 400 without loading entries", async () => {
    const { execute, request } = setUp();

    const response = await request("?filter=popular");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Unknown filter "popular"',
      allowedFilters: ["long-titles", "short-titles"],
    });
    expect(execute).not.toHaveBeenCalled();
  });

  it.each([
    ["Hacker News is unreachable", new EntrySourceError("HTTP 503"), 502],
    ["anything else fails", new Error("database locked"), 500],
  ])("responds %s with the matching status", async (_case, error, status) => {
    const { execute, request } = setUp();
    execute.mockRejectedValue(error);

    const response = await request();

    expect(response.status).toBe(status);
  });
});
