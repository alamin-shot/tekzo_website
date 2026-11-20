import fetchAPI from "@/utils/fetchAPI";
import { cache } from "react";

export const getCategories = cache(async () => {
  const response = await fetchAPI("/categories");
  const data = Array.isArray(response) ? response : response?.data;

  if (!Array.isArray(data)) {
    console.error("Data fetch error");
    return [];
  }

  return data;
});
