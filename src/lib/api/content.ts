import { cache } from "react";
import type { FaqsResult, OutletsResult } from "@/types/content";
import fetchPublicAPI from "@/lib/http/fetchPublicAPI";
import { isList, orList, rec } from "@/lib/json";
import { dataOf, logFetchError, setIf } from "./shared";

// ---------- News / blogs / reels ----------

export const getNews = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/news", {
      tags: ["news"],
      revalidate: false,
    });
    return dataOf(result) ?? null;
  } catch (err) {
    logFetchError("News Fetch Error:", err);
    return null;
  }
});

export const getBlogs = cache(async (page?: unknown, perPage?: unknown): Promise<unknown> => {
  try {
    const query = new URLSearchParams();
    setIf(query, "page", page);
    setIf(query, "per_page", perPage);
    const qs = query.toString();
    const endpoint = qs ? `/blogs?${qs}` : "/blogs";
    const result = await fetchPublicAPI(endpoint, {
      tags: ["blogs"],
      revalidate: false,
    });
    return dataOf(result) ?? null;
  } catch (err) {
    logFetchError("Blogs Fetch Error:", err);
    return null;
  }
});

export const getFeaturedBlog = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/featured-blogs", {
      tags: ["blogs"],
      revalidate: false,
    });
    return dataOf(result) ?? null;
  } catch (err) {
    logFetchError("Featured Blog Fetch Error:", err);
    return null;
  }
});

export const getRecentBlogs = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/recent-blogs", {
      tags: ["blogs"],
      revalidate: false,
    });
    return dataOf(result) ?? [];
  } catch (err) {
    logFetchError("Recent Blogs Fetch Error:", err);
    return [];
  }
});

export const getPopularBlogs = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/popular-blogs", {
      tags: ["blogs"],
      revalidate: false,
    });
    return dataOf(result) ?? [];
  } catch (err) {
    logFetchError("Popular Blogs Fetch Error:", err);
    return [];
  }
});

export const getTrendingBlogs = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/trending-blogs", {
      tags: ["blogs"],
      revalidate: false,
    });
    return dataOf(result) ?? [];
  } catch (err) {
    logFetchError("Trending Blogs Fetch Error:", err);
    return [];
  }
});

export const getBlogBySlug = cache(async (slug: unknown): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI(`/blogs/${slug}`, {
      tags: ["blogs", `blog-${slug}`],
      revalidate: false,
    });
    return dataOf(result) ?? null;
  } catch (err) {
    logFetchError("Blog By Slug Fetch Error:", err);
    return null;
  }
});

export const getBlogsByTag = cache(async (slug: unknown, page?: unknown): Promise<unknown> => {
  try {
    const endpoint = page ? `/blog-tags/${slug}?page=${page}` : `/blog-tags/${slug}`;
    const result = await fetchPublicAPI(endpoint, {
      tags: ["blogs", `blog-${slug}`],
      revalidate: false,
    });
    return dataOf(result) ?? null;
  } catch (err) {
    logFetchError("Blogs By Tag Fetch Error:", err);
    return null;
  }
});

export const getReels = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/reels-videos", {
      tags: ["reels-video"],
      revalidate: false,
    });
    return dataOf(result) ?? [];
  } catch (err) {
    logFetchError("Reels Fetch Error:", err);
    return [];
  }
});

// ---------- Policies / FAQ / outlets / careers ----------

export const getPolicies = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/policies", {
      tags: ["policies"],
      revalidate: false,
    });
    return dataOf(result) ?? [];
  } catch (err) {
    logFetchError("Policies Fetch Error:", err);
    return [];
  }
});

export const getPolicyBySlug = cache(async (slug: unknown): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI(`/policies/${slug}`, {
      tags: [`policy-${slug}`],
      revalidate: false,
    });
    return dataOf(result) ?? null;
  } catch (err) {
    logFetchError("Policy Fetch Error:", err);
    return null;
  }
});

export const getFaqs = cache(async (): Promise<FaqsResult> => {
  try {
    const result = await fetchPublicAPI("/faqs", {
      tags: ["faqs"],
      revalidate: false,
    });
    const data = dataOf(result);
    if (!data) return { faqs: [], seoData: {} };
    return {
      faqs: orList(rec(data)?.faqs).flat().filter(Boolean),
      seoData: rec(data)?.seoData || {},
    };
  } catch (err) {
    logFetchError("FAQ Fetch Error:", err);
    return { faqs: [], seoData: {} };
  }
});

export const getOutlets = cache(async (): Promise<OutletsResult> => {
  try {
    const result = await fetchPublicAPI("/outlets", {
      tags: ["outlets"],
      revalidate: false,
    });
    const data = rec(dataOf(result));
    return {
      outlets: data?.outlets ?? [],
      seoData: data?.seoData ?? null,
    };
  } catch (err) {
    logFetchError("Outlets Fetch Error:", err);
    return { outlets: [], seoData: null };
  }
});

export const getCareers = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/careers");
    const data = dataOf(result);
    if (data) return data;
    if (isList(result)) return result;
    return [];
  } catch (err) {
    logFetchError("Careers Fetch Error:", err);
    return [];
  }
});

export const getTeamMembers = cache(async (): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI("/our-teams");
    return dataOf(result) ?? result ?? [];
  } catch (err) {
    logFetchError("Team Members Fetch Error:", err);
    return [];
  }
});

export const getJobDetails = cache(async (slug: unknown): Promise<unknown> => {
  try {
    const result = await fetchPublicAPI(`/careers/${slug}`);
    return dataOf(result) ?? null;
  } catch (err) {
    logFetchError("Job Details Fetch Error:", err);
    return null;
  }
});
