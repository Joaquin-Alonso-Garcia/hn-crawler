import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EntriesDashboard } from "@/components/entries-dashboard";
import type { EntriesResponse } from "@/lib/entries-api";
import type { Entry } from "@/src/domain/entry";

const shortTitle: Entry = {
  rank: 1,
  title: "Short title here",
  points: 50,
  commentCount: 3,
};
const longTitle: Entry = {
  rank: 2,
  title: "A rather long title with many words",
  points: 10,
  commentCount: 40,
};
const CRAWLED_AT = "2026-10-26T18:15:00.000Z";

const RESPONSES: Record<string, EntriesResponse> = {
  "/api/entries": {
    entries: [shortTitle, longTitle],
    appliedFilter: "none",
    crawledAt: CRAWLED_AT,
  },
  "/api/entries?filter=long-titles": {
    entries: [longTitle],
    appliedFilter: "long-titles",
    crawledAt: CRAWLED_AT,
  },
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

function stubApi() {
  const fetchMock = vi.fn(async (url: string) => jsonResponse(RESPONSES[url]));
  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

function renderDashboard() {
  return render(
    <SWRConfig
      value={{
        provider: () => new Map(),
        dedupingInterval: 0,
        shouldRetryOnError: false,
      }}
    >
      <EntriesDashboard />
    </SWRConfig>,
  );
}

describe("EntriesDashboard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a loading state, then every front page story", async () => {
    stubApi();
    renderDashboard();

    expect(
      screen.getByRole("status", { name: "Loading stories" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("2 stories")).toBeInTheDocument();
    expect(screen.getByText("Short title here")).toBeInTheDocument();
    expect(
      screen.getByText("A rather long title with many words"),
    ).toBeInTheDocument();
  });

  it("switches to long titles sorted by comments", async () => {
    const fetchMock = stubApi();
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByText("2 stories");

    await user.click(screen.getByRole("button", { name: /Long titles/ }));

    expect(await screen.findByText("1 story")).toBeInTheDocument();
    expect(screen.queryByText("Short title here")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Long titles/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("columnheader", { name: /Comments/ }),
    ).toHaveAttribute("aria-sort", "descending");
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/entries?filter=long-titles",
    );
  });

  it("shows the API error and recovers on retry", async () => {
    const fetchMock = stubApi();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: "Hacker News is unavailable right now" }, 502),
    );
    const user = userEvent.setup();
    renderDashboard();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Hacker News is unavailable right now",
    );

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText("2 stories")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
