import ProfileView from "./ProfileView";
import { getAuthUser } from "@/fetch-API/getAuthUser";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await getAuthUser();


  if (!user) redirect("/login");

  // UPD-002: verification status now comes from GET /customer/profile
  // (is_phone_verified / phone_verified_at / is_email_verified / email_verified_at).

  return (
    <div className="w-full">
      <title>Profile - Tekzo Dashboard</title>
      <ProfileView user={user} />
    </div>
  );
}
