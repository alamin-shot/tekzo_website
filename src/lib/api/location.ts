import { cache } from "react";
import fetchPublicAPI from "@/lib/http/fetchPublicAPI";
import { dataOf, logFetchError } from "./shared";

// ---------- Districts (for Sell Your Device location select) ----------

export const getDistricts = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/districts", {
      tags: ["districts"],
      revalidate: false,
    });
    return dataOf(result) ?? [];
  } catch (err) {
    logFetchError("Districts Fetch Error:", err);
    return [];
  }
});
