import ProfileView from "./ProfileView";
import { getAuthUser } from "@/fetch-API/getAuthUser";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await getAuthUser();


  if (!user) redirect("/login");

  // Add static verification status for demo purposes
  const userWithVerification = {
    ...user,
    email_verified: true, // Static verification status for email
    phone_verified: false, // Static verification status for phone
  };

  return (
    <div className="w-full">
      <title>Profile - Tekzo Dashboard</title>
      <ProfileView user={userWithVerification} />
    </div>
  );
}
