import clientFetchAPI from "@/utils/clientFetchAPI";
import hasAuthCookie from "@/utils/hasAuthCookie";

export async function getAuthUser() {
  if (!hasAuthCookie()) return null;
  try {
    const response = await clientFetchAPI("/customer/profile", "GET");
    return response?.data || null;
  } catch (error) {
    return null;
  }
}
