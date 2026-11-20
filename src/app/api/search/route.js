import { NextResponse } from "next/server";
import { normalizeSearchResponse } from "@/lib/search/mapSearchProduct";

// Same-origin BFF for the live search modal: browser -> /api/search -> backend
// (see docs/diagnosis/02-search-bug.md). Always responds with
// { data: SearchProduct[], total } so the UI never has to guess the shape.

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const MAX_QUERY_LENGTH = 100;
const UPSTREAM_TIMEOUT_MS = 8000;
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
};

const json = (body, status, headers = {}) =>
  NextResponse.json(body, { status, headers });
const results = (data, headers) => json({ data, total: data.length }, 200, headers);
const failure = (message, status) => json({ data: [], total: 0, message }, status);

export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const query = (params.get("q") ?? params.get("query") ?? "").trim();

  if (!query) return results([]);
  if (query.length > MAX_QUERY_LENGTH) {
    return failure("Search query is too long.", 400);
  }

  // DEV-ONLY offline mode (backend down): serve the committed sample response.
  // NODE_ENV is inlined at build time, so in production builds this whole
  // block, including the fixture import, is dead code and is never bundled.
  if (process.env.NODE_ENV !== "production" && process.env.SEARCH_FIXTURE === "1") {
    const { default: sample } = await import(
      "@/lib/search/__fixtures__/search-products.sample.json"
    );
    const needle = query.toLowerCase();
    return results(
      normalizeSearchResponse(sample).filter((p) =>
        p.name.toLowerCase().includes(needle),
      ),
    );
  }

  if (!API_URL) return failure("Search is not configured.", 500);

  // Abort the upstream call if the browser cancels (stale keystrokes) or the
  // backend hangs; without a timeout a down API holds the request ~20s.
  const signal = AbortSignal.any([
    request.signal,
    AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  ]);

  let upstream;
  try {
    upstream = await fetch(
      `${API_URL}/search-products?query=${encodeURIComponent(query)}`,
      {
        headers: { Accept: "application/json" },
        signal,
        next: { revalidate: 60 }, // identical queries within 60s hit the cache
      },
    );
  } catch (err) {
    return err?.name === "TimeoutError"
      ? failure("Search timed out.", 504)
      : failure("Search is unavailable.", 502);
  }

  if (!upstream.ok) return failure("Search is unavailable.", 502);

  // Upstream errors (e.g. Cloudflare 5xx pages) can be HTML, not JSON.
  let body;
  try {
    body = await upstream.json();
  } catch {
    return failure("Search returned an invalid response.", 502);
  }

  return results(normalizeSearchResponse(body), CACHE_HEADERS);
}
