import { useEffect, useState } from "react";

const DEBOUNCE_MS = 400;
const UNAVAILABLE = "Search is temporarily unavailable. Please try again shortly.";

// Debounced live search against the same-origin /api/search route.
// Returns mapped products ({ data } from the route), a loading flag and a
// user-facing error message (null when the last search succeeded).
export function useProductSearch(query) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      // Clearing the box also clears a loading flag left behind by a
      // request that was aborted mid-flight (previously stuck on skeleton).
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Abort the in-flight request when the query changes, so a slow older
    // response can't overwrite newer results.
    const controller = new AbortController();
    const id = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          // 400 carries a user-facing reason (e.g. query too long); every
          // other failure gets the generic "unavailable" message.
          throw new Error(res.status === 400 && body?.message ? body.message : UNAVAILABLE);
        }
        setResults(Array.isArray(body?.data) ? body.data : []);
        setError(null);
      } catch (err) {
        if (err?.name === "AbortError") return; // superseded by a newer query
        console.error("Search error:", err);
        setResults([]);
        setError(err?.message || UNAVAILABLE);
      }
      setIsLoading(false);
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [query]);

  return { results, isLoading, error };
}
