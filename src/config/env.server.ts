import "server-only";
import { z } from "zod";
import type { ServerEnv, ServerEnvIssue } from "@/types/env";

// Server-only secrets. Importing this file from a Client Component fails the
// build ("server-only"), so secrets can never reach a browser bundle.
//
// Parity rule: today a missing REVALIDATION_SECRET makes /api/revalidate
// reject requests and a missing INTERNAL_API_TOKEN simply omits the
// X-Internal-Token header. So validation here never throws and never
// substitutes values: it only reports problems once, then exposes the raw
// values unchanged.

const optionalSecret = z.string().min(1, "is set but empty").optional();

const serverEnvSchema = z.object({
  REVALIDATION_SECRET: optionalSecret,
  INTERNAL_API_TOKEN: optionalSecret,
  SEARCH_FIXTURE: z.string().optional(),
});

const raw: ServerEnv = {
  REVALIDATION_SECRET: process.env.REVALIDATION_SECRET,
  INTERNAL_API_TOKEN: process.env.INTERNAL_API_TOKEN,
  SEARCH_FIXTURE: process.env.SEARCH_FIXTURE,
};

const isServerEnvKey = (key: PropertyKey): key is keyof ServerEnv =>
  key === "REVALIDATION_SECRET" || key === "INTERNAL_API_TOKEN" || key === "SEARCH_FIXTURE";

function collectIssues(): ServerEnvIssue[] {
  const issues: ServerEnvIssue[] = [];
  const parsed = serverEnvSchema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key !== undefined && isServerEnvKey(key)) issues.push({ key, message: issue.message });
    }
  }
  if (!raw.REVALIDATION_SECRET) issues.push({ key: "REVALIDATION_SECRET", message: "is not set; POST /api/revalidate will reject every request" });
  if (!raw.INTERNAL_API_TOKEN) issues.push({ key: "INTERNAL_API_TOKEN", message: "is not set; X-Internal-Token header will be omitted" });
  return issues;
}

let reported = false;

/** Logs missing/empty server secrets once per process. Never throws. */
export function reportServerEnvIssues(): ServerEnvIssue[] {
  const issues = collectIssues();
  if (!reported && issues.length) {
    reported = true;
    for (const { key, message } of issues) console.warn(`[env] ${key} ${message}`);
  }
  return issues;
}

/** Raw server secrets, exactly as process.env provides them. */
export const serverEnv: ServerEnv = raw;
