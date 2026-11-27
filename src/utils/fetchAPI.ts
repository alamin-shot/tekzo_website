// Moved to lib/http (P2). Kept so existing `@/utils/fetchAPI` imports keep working.
// No "use server" here: the directive lives on lib/http/fetchAPI.ts, and a
// re-export keeps it a Server Action for client importers (KNOWN BUG #4).
export { default } from "@/lib/http/fetchAPI";
