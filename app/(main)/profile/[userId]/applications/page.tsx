import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "@/lib/actions/user";
import { OrganizationApplication } from "@/components/setting/OrganizationApplication";
import ApplicationsClientWrapper from "./ApplicationsClientWrapper";

interface ApplicationsPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function ApplicationsPage({
  params,
}: ApplicationsPageProps) {
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

  // Only allow users to access their own applications page
  if (user.id !== profileOwner.clerkId) {
    redirect(`/profile/${userId}`);
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {profileOwner.role === "BUSINESS_OWNER" && <OrganizationApplication />}
        {profileOwner.role === "USER" && <ApplicationsClientWrapper />}
      </div>
    </div>
  );
}
