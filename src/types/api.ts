// Backend REST API (Laravel) response conventions.
import type { SearchProduct } from "./product";

/** Most endpoints wrap the payload as `{ data: … }`. */
export type ApiEnvelope<T> = {
  data: T;
  message?: string;
};

/** Laravel validation errors (`errors` field of a 4xx body). */
export type ApiFieldErrors = Record<string, string[]>;

/**
 * Error thrown by clientFetchAPI: `new Error(message)` plus `status` and the
 * raw `errors` value from the body (`data?.errors || null`, usually an
 * ApiFieldErrors bag, passed through unvalidated).
 */
export type ClientFetchError = Error & {
  status: number;
  errors: unknown;
};

/** Error thrown by fetchPublicAPI (status only) and fetchAPI (status + raw `errors`). */
export type ApiHttpError = Error & {
  status: number;
  errors?: unknown;
};

/** fetchPublicAPI options: fetch init plus the `tags`/`revalidate` shorthands it maps onto `next`. */
export type PublicFetchOptions = RequestInit & {
  tags?: string[];
  revalidate?: number | false;
};

/** GET /api/search response body (always this shape). */
export type SearchResponseBody = {
  data: SearchProduct[];
  total: number;
  message?: string;
};

/** HTTP methods passed to clientFetchAPI today (default "POST"). */
export type ClientFetchMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
