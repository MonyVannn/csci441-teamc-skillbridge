import { ProfileContent } from "@/components/profile/ProfileContent";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import ProfileNotFoundPage from "@/components/profile/ProfileNotFound";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { getUserByClerkId } from "@/lib/actions/user";

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = params;
  const userData = await getUserByClerkId(userId);

  if (!userData) {
    return <ProfileNotFoundPage />;
  }
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <ProfileHeader user={userData} />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-4 pb-8">
          <div className="lg:col-span-3">
            <ProfileContent user={userData} />
          </div>
          <div className="lg:col-span-1">
            <ProfileSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
