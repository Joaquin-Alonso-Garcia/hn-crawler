import { describe, expect, it } from "vitest";
import { entriesUrl, fetchEntries } from "@/lib/entries-api";
import { FilterType } from "@/src/domain/filters/filter-type";
import { stubFetchResponse } from "../helpers/stub-fetch";

describe("entriesUrl", () => {
  it.each([
    [null, "/api/entries"],
    [FilterType.LongTitles, "/api/entries?filter=long-titles"],
  ])("builds the URL for filter %s", (filter, expected) => {
    expect(entriesUrl(filter)).toBe(expected);
  });
});

describe("fetchEntries", () => {
  it("returns the parsed body on success", async () => {
    stubFetchResponse('{"entries":[],"appliedFilter":"none"}', 200);

    await expect(fetchEntries("/api/entries")).resolves.toEqual({
      entries: [],
      appliedFilter: "none",
    });
  });

  it("surfaces the API error message", async () => {
    stubFetchResponse('{"error":"Hacker News is unavailable right now"}', 502);

    await expect(fetchEntries("/api/entries")).rejects.toThrow(
      "Hacker News is unavailable right now",
    );
  });

  it("falls back to the status code when the error body is not JSON", async () => {
    stubFetchResponse("<html>Bad Gateway</html>", 502);

    await expect(fetchEntries("/api/entries")).rejects.toThrow(
      "Request failed with HTTP 502",
    );
  });
});
