import { useEffect, useState } from "react";
import type { SearchProduct } from "@/types/product";
import type { ProductSearchState } from "@/types/search";
import { isList, rec } from "@/lib/json";
import { isSearchProduct } from "@/lib/search/mapSearchProduct";

const DEBOUNCE_MS = 400;
const UNAVAILABLE = "Search is temporarily unavailable. Please try again shortly.";

// Debounced live search against the same-origin /api/search route.
// Returns mapped products ({ data } from the route), a loading flag and a
// user-facing error message (null when the last search succeeded).
export function useProductSearch(query: string): ProductSearchState {
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const body: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          // 400 carries a user-facing reason (e.g. query too long); every
          // other failure gets the generic "unavailable" message.
          const message = rec(body)?.message;
          throw new Error(res.status === 400 && message ? String(message) : UNAVAILABLE);
        }
        // /api/search builds every item with mapSearchProduct, so all pass
        // isSearchProduct (AUDIT_NOTES P5c).
        const data = rec(body)?.data;
        setResults(isList(data) ? data.filter(isSearchProduct) : []);
        setError(null);
      } catch (err) {
        if (rec(err)?.name === "AbortError") return; // superseded by a newer query
        console.error("Search error:", err);
        setResults([]);
        const message = rec(err)?.message;
        setError(message ? String(message) : UNAVAILABLE);
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
