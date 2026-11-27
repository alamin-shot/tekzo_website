import { cache } from "react";
import fetchPublicAPI from "@/lib/http/fetchPublicAPI";
import { dataOf, logFetchError } from "./shared";

// ---------- Settings ----------

export const getSettings = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/settings", {
      tags: ["settings"],
      revalidate: false,
    });
    return dataOf(result) ?? [];
  } catch (err) {
    logFetchError("Settings Fetch Error:", err);
    return [];
  }
});

// generic static SEO page — /seos/<page>, e.g. "about-us", "checkout"
export const getSeoPage = cache(async (page: unknown): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI(`/seos/${page}`, {
      tags: ["page-seo"],
      revalidate: false,
    });
    return dataOf(result) ?? null;
  } catch (err) {
    logFetchError(`SEO Page Fetch Error [${page}]:`, err);
    return null;
  }
});

// ---------- Popup Dialog ----------

export const getPopupDialog = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/popup-dialogs", {
      tags: ["popup-dialogs"],
      revalidate: false,
    });
    return dataOf(result) ?? null;
  } catch (err) {
    logFetchError("Popup Dialog Fetch Error:", err);
    return null;
  }
});
