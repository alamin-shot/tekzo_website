import fetchAPI from "@/utils/fetchAPI";

export default async function getFeature() {
  try {
    const result = await fetchAPI("/featured-products");
    return result?.data || [];
  } catch (err) {
    console.error("Brands fetch error:", err);
    return [];
  }
}
