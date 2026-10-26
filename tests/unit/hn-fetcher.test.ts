import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchHackerNewsHtml,
  HACKER_NEWS_URL,
} from "@/src/infrastructure/scraper/hn-fetcher";

function stubFetchResponse(body: string, status: number) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(body, { status }));
  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

describe("fetchHackerNewsHtml", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

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
