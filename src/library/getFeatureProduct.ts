import fetchAPI from "@/utils/fetchAPI";
import { rec } from "@/lib/json";

export default async function getFeature(): Promise<unknown> {
  try {
    const result = await fetchAPI("/featured-products");
    return rec(result)?.data || [];
  } catch (err) {
    console.error("Brands fetch error:", err);
    return [];
  }
}
