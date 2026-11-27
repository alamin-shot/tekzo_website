import { getAuthUser } from "@/fetch-API/getAuthUser";
import EditProfile from "./EditProfile";

export default async function Page() {
  const user = await getAuthUser();
  return (
    <div className="w-full">
      <title>Edit Profile - Tekzo Dashboard</title>

      <EditProfile user={user} />
    </div>
  );
}
