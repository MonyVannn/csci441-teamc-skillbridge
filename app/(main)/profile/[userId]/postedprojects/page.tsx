import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OrganizationPostedProjects } from "@/components/setting/OrganizationPostedProject";
import { getUserByClerkId } from "@/lib/actions/user";

interface PostedProjectsPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function PostedProjectsPage({
  params,
}: PostedProjectsPageProps) {
  const { userId } = await params;
  const user = await currentUser();

  // Check if user is authenticated
  if (!user) {
    redirect("/sign-in");
  }

  // Fetch the profile owner's data
  const profileOwner = await getUserByClerkId(userId);

  if (!profileOwner) {
    redirect("/");
  }

  // Only allow business owners to access this page, and only their own page
  if (
    profileOwner.role !== "BUSINESS_OWNER" ||
    user.id !== profileOwner.clerkId
  ) {
    redirect(`/profile/${userId}`);
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <OrganizationPostedProjects />
      </div>
    </div>
  );
}
