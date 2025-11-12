import { ProfileContent } from "@/components/profile/ProfileContent";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import ProfileNotFoundPage from "@/components/profile/ProfileNotFound";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { getCompletedProjectsByAssignedStudentId } from "@/lib/actions/project";
import { getUserByClerkId, getUsersRecommendation } from "@/lib/actions/user";

interface ProfilePageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;

  // First check if user exists
  const userData = await getUserByClerkId(userId);

  if (!userData) {
    return <ProfileNotFoundPage />;
  }

  // Only fetch additional data if user exists
  const [completedProjects, recommendation] = await Promise.all([
    getCompletedProjectsByAssignedStudentId(userId),
    getUsersRecommendation(),
  ]);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <ProfileHeader user={userData} />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-4 pb-8">
          <div className="lg:col-span-3">
            <ProfileContent user={userData} projects={completedProjects} />
          </div>
          <div className="lg:col-span-1">
            <ProfileSidebar peopleYouMayKnow={recommendation} />
          </div>
        </div>
      </div>
    </div>
  );
}
