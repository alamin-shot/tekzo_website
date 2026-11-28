// User-facing messages for backend errors (status + message + 422 `errors`
// as thrown by fetchAPI / clientFetchAPI).
import type { SocialProvider } from "@/types/social";
import { errMessage, firstOf, rec } from "@/lib/json";

export const RATE_LIMIT_MESSAGE = "Too many attempts. Please wait a minute and try again.";

export const SOCIAL_LABELS: Record<SocialProvider, string> = {
  google: "Google",
  facebook: "Facebook",
  apple: "Apple",
};

/** HTTP status carried by a thrown API error (undefined for network errors). */
export function apiStatus(err: unknown): unknown {
  return rec(err)?.status;
}

/** The backend message, a friendly rate-limit message on 429, or `fallback`. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (apiStatus(err) === 429) return RATE_LIMIT_MESSAGE;
  const message = errMessage(err);
  return typeof message === "string" && message ? message : fallback;
}

/** First 422 message for `field` (`errors.<field>[0]`), or undefined. */
export function fieldErrorOf(err: unknown, field: string): string | undefined {
  const value = rec(rec(err)?.errors)?.[field];
  const first = value === undefined ? undefined : firstOf(value);
  return typeof first === "string" ? first : undefined;
}

/** Social sign-in / account-linking errors (401 / 409 / 503 / 429). */
export function socialErrorMessage(err: unknown, provider: SocialProvider): string {
  const label = SOCIAL_LABELS[provider];
  const status = apiStatus(err);
  const backend = errMessage(err);
  const detail = typeof backend === "string" && backend ? backend : "";
  if (status === 429) return RATE_LIMIT_MESSAGE;
  if (status === 401) return `We couldn't verify your ${label} account. Please try again.`;
  if (status === 409) return detail || `This ${label} account is already linked to another customer.`;
  if (status === 503) return `${label} sign-in isn't available right now. Please use email or mobile number.`;
  return detail || `${label} sign-in failed. Please try again.`;
}
