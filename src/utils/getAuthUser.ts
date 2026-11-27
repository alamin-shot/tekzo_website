import clientFetchAPI from "@/utils/clientFetchAPI";
import hasAuthCookie from "@/utils/hasAuthCookie";
import { rec } from "@/lib/json";

// Logged-in customer profile from the browser (GET /customer/profile via
// /api/client-fetch), or null for guests and on any error.
export async function getAuthUser(): Promise<unknown> {
  if (!hasAuthCookie()) return null;
  try {
    const response = await clientFetchAPI("/customer/profile", "GET");
    return rec(response)?.data || null;
  } catch {
    return null;
  }
}
