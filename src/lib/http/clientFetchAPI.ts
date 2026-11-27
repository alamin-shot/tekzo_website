import type { ClientFetchError, ClientFetchMethod } from "@/types/api";
import { rec } from "@/lib/json";

// Browser → /api/client-fetch → backend (path B in docs/context/SYSTEM_MAP.md).
// The route adds the httpOnly auth_token; guest access is limited to its
// GUEST_ENDPOINTS allow-list (KNOWN BUG #3 — preserved).

const toError = (data: unknown, status: number): ClientFetchError => {
  const body = rec(data);
  return Object.assign(new Error(String(body?.message || "Something went wrong")), {
    status,
    errors: body?.errors || null,
  });
};

const clientFetchAPI = async (endpoint: string, method: ClientFetchMethod = "POST", body: unknown = null): Promise<unknown> => {
  if (body instanceof FormData) {
    body.append("_endpoint", endpoint);

    const response = await fetch("/api/client-fetch", {
      method: "POST",
      body: body,
    });

    const data: unknown = await response.json();

    if (!response.ok) throw toError(data, response.status);

    return data;
  }

  const response = await fetch("/api/client-fetch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint, method, body }),
  });

  const data: unknown = await response.json();

  if (!response.ok) throw toError(data, response.status);

  return data;
};

export default clientFetchAPI;
