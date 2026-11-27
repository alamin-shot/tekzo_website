// Shapes of the typed environment config (src/config/env.ts, env.server.ts).
// Values stay `string | undefined`: today every caller applies its own
// fallback (e.g. NEXT_PUBLIC_URL || "https://www.tekzo.com.bd"), and a
// missing value must keep behaving exactly as it does now.

export type PublicEnv = {
  /** Backend base URL incl. version prefix, no trailing slash. */
  NEXT_PUBLIC_API_URL: string | undefined;
  /** Public site origin, no trailing slash. */
  NEXT_PUBLIC_URL: string | undefined;
  /** GTM container id. */
  NEXT_PUBLIC_GTM_ID: string | undefined;
  /** "salamat" shows Partners menu/footer links; empty = Tekzo. */
  NEXT_PUBLIC_ECOMMERCE_TYPE: string | undefined;
};

export type ServerEnv = {
  /** Shared secret for POST /api/revalidate. */
  REVALIDATION_SECRET: string | undefined;
  /** Sent as X-Internal-Token when present (optional today). */
  INTERNAL_API_TOKEN: string | undefined;
  /** Dev-only: "1" makes /api/search serve the local fixture. */
  SEARCH_FIXTURE: string | undefined;
};

export type ServerEnvIssue = {
  key: keyof ServerEnv;
  message: string;
};
