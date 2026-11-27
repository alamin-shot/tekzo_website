import type { ApiHttpError, PublicFetchOptions } from "@/types/api";
import { errMessage, isNextRedirect, rec } from "@/lib/json";

// Public (unauthenticated) backend fetch — path A in docs/context/SYSTEM_MAP.md.
// Used by Server Components through lib/api and, by mistake, from a few
// client components (AUDIT_NOTES 8c), so it must stay importable on both.

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;
const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN; // undefined in the browser bundle

const fetchPublicAPI = async (endpoint: string, options: PublicFetchOptions = {}): Promise<unknown> => {
  const isServer = typeof window === "undefined";
  const url = `${BASE_API_URL}${endpoint}`;

  const { tags, revalidate, next, headers, ...rest } = options;

  const nextOptions = {
    ...(next || {}),
    ...(tags && { tags }),
    ...(revalidate !== undefined && { revalidate }),
  };

  try {
    const response = await fetch(url, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(isServer && INTERNAL_API_TOKEN && { "X-Internal-Token": INTERNAL_API_TOKEN }),
        ...headers,
      },
      ...(Object.keys(nextOptions).length > 0 && { next: nextOptions }),
    });

    const data: unknown = await response.json();

    if (!response.ok) {
      const error: ApiHttpError = Object.assign(new Error(String(rec(data)?.message || `HTTP error! status: ${response.status}`)), {
        status: response.status,
      });
      throw error;
    }

    return data;
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    console.error(`API fetch error [${endpoint}]:`, errMessage(error));
    throw error;
  }
};

export default fetchPublicAPI;
