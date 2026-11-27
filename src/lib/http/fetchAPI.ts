"use server";

import { cookies } from "next/headers";
import type { ApiHttpError } from "@/types/api";
import { errMessage, isNextRedirect, rec } from "@/lib/json";

// Authenticated backend fetch (auth_token cookie → Bearer) — path A′ in
// docs/context/SYSTEM_MAP.md.
//
// KNOWN BUG #4 (preserved): the "use server" directive makes this a public
// Server Action whenever a Client Component imports it (search modal via
// library/*). Do not remove the directive in the conversion pass.

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;
const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN;

const fetchAPI = async (endpoint: string, options: RequestInit = {}): Promise<unknown> => {
  const url = `${BASE_API_URL}${endpoint}`;
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  try {
    // Order preserved: a caller's `options.headers` replaces the merged
    // headers entirely because `...options` is spread after them.
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(INTERNAL_API_TOKEN && { "X-Internal-Token": INTERNAL_API_TOKEN }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    });

    const data: unknown = await response.json();

    if (!response.ok) {
      const body = rec(data);
      const error: ApiHttpError = Object.assign(new Error(String(body?.message || `HTTP error! status: ${response.status}`)), {
        status: response.status,
        errors: body?.errors || null,
      });
      throw error;
    }

    return data;
  } catch (error) {
    if (isNextRedirect(error)) throw error;

    if (rec(error)?.status === 401) {
      throw error;
    }

    console.error(`API fetch error [${endpoint}]:`, errMessage(error));
    throw error;
  }
};

export default fetchAPI;
