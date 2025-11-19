import { ProfileContent } from "@/components/profile/ProfileContent";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import ProfileNotFoundPage from "@/components/profile/ProfileNotFound";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { getCompletedProjectsByAssignedStudentId } from "@/lib/actions/project";
import { getUserByClerkId, getUsersRecommendation } from "@/lib/actions/user";
import { currentUser } from "@clerk/nextjs/server";

interface ProfilePageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;

  // Get current user to check if viewing own profile
  const currentUserData = await currentUser();

  // First check if user exists
  const userData = await getUserByClerkId(userId);

  if (!userData) {
    return <ProfileNotFoundPage />;
  }

  // Check if the current user is viewing their own profile
  const isOwnProfile = currentUserData?.id === userId;

  // Only fetch additional data if user exists
  const [completedProjects, recommendation] = await Promise.all([
    getCompletedProjectsByAssignedStudentId(userId),
    getUsersRecommendation(),
  ]);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <ProfileHeader user={userData} isOwnProfile={isOwnProfile} />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-4 pb-8">
          <div className="lg:col-span-3">
            <ProfileContent
              user={userData}
              projects={completedProjects}
              isOwnProfile={isOwnProfile}
            />
          </div>
          <div className="lg:col-span-1">
            <ProfileSidebar peopleYouMayKnow={recommendation} />
          </div>
        </div>
      </div>
    </div>
  );
}
