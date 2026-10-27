import { describe, expect, it } from "vitest";
import {
  fetchHackerNewsHtml,
  HACKER_NEWS_URL,
} from "@/src/infrastructure/scraper/hn-fetcher";
import { stubFetchResponse } from "../helpers/stub-fetch";

describe("fetchHackerNewsHtml", () => {
  it("returns the front page HTML with a timeout attached", async () => {
    const fetchMock = stubFetchResponse("<html>front page</html>", 200);

    await expect(fetchHackerNewsHtml()).resolves.toBe(
      "<html>front page</html>",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      HACKER_NEWS_URL,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("throws when Hacker News responds with an error status", async () => {
    stubFetchResponse("Service Unavailable", 503);

    await expect(fetchHackerNewsHtml()).rejects.toThrow("HTTP 503");
  });
});
