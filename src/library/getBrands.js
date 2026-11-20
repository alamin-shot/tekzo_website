import fetchAPI from "@/utils/fetchAPI";

export default async function getBrands() {
  try {
    const result = await fetchAPI("/brands");
    return result?.data || [];
  } catch (err) {
    console.error("Brands fetch error:", err);
    return [];
  }
}
