import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/server/session";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "@/components/features/profile/profile-form";

export default async function ProfilePage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login?reason=unauthorized");
  }

  return (
    <div className="space-y-6">
      <Card title="Profile Settings" description="Manage your account details">
        <ProfileForm profile={session.profile} />
      </Card>
    </div>
  );
}
