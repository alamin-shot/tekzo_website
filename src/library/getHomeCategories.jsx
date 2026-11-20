import fetchAPI from "@/utils/fetchAPI";

export default async function getHomeCategories() {
  try {
    const result = await fetchAPI("/home-categories");
    return result || [];
  } catch (err) {
    console.error("cat fetch error:", err);
    return [];
  }
}

