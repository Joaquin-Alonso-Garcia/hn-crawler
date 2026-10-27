import { vi } from "vitest";

export function stubFetchResponse(body: string, status: number) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(body, { status }));
  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}
