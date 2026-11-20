import fetchAPI from "@/utils/fetchAPI";
import { getAuthUser } from "@/fetch-API/getAuthUser";
import EliteContent from "./EliteContent";

async function getEliteTiers() {
  try {
    const result = await fetchAPI("/elite");
    return result?.data || [];
  } catch {
    return [];
  }
}

export default async function PointsPage() {
  const [user, tiers] = await Promise.all([getAuthUser(), getEliteTiers()]);

  return (
    <div className="w-full">
      <title>Elite Status - Tekzo Dashboard</title>

      <EliteContent user={user} tiers={tiers} />
    </div>
  );
}
