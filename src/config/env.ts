import type { PublicEnv } from "@/types/env";

// Public (NEXT_PUBLIC_*) environment values, safe for client and server.
// Each value is referenced literally so Next.js inlines it at build time —
// never read these through a dynamic key (process.env[key]) or they become
// undefined in the browser. No defaults are applied here: callers keep their
// existing fallbacks so a missing value behaves exactly as before.
export const publicEnv: PublicEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  NEXT_PUBLIC_ECOMMERCE_TYPE: process.env.NEXT_PUBLIC_ECOMMERCE_TYPE,
};
