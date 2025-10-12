"use client";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  ArrowRight,
  BriefcaseBusiness,
  FolderClock,
  GraduationCap,
  Plus,
  ScanFace,
  ScrollText,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { UserExperience } from "./setting/UserExperience";
import { UserEducation } from "./setting/UserEducation";
import { UserInformation } from "./setting/UserInformation";
import { PostProjectModal } from "./project/PostProjectModal";
import { User } from "@prisma/client";
import { OrganizationPostedProjects } from "./setting/OrganizationPostedProject";
import { SearchBar } from "./browse/SearchBar";
import { UserApplications } from "./setting/UserApplication";
import { OrganizationApplication } from "./setting/OrganizationApplication";
import { getUserByClerkId } from "@/lib/actions/user";

interface HeaderContentProps {
  user: User | null;
  totalUnrespondedApplications: number | null;
}

const HeaderContent: React.FC<HeaderContentProps> = ({
  user: serverUser,
  totalUnrespondedApplications,
}) => {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user: clerkUser, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState<User | null>(serverUser);

  useEffect(() => {
    // When Clerk user loads and we have their ID, fetch the database user
    if (isLoaded && clerkUser?.id && !dbUser) {
      getUserByClerkId(clerkUser.id).then((user) => {
        if (user) setDbUser(user);
      });
    }
  }, [isLoaded, clerkUser?.id, dbUser]);

  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))
    return null;

  return (
    <header className="bg-[#121212] border-b py-4 px-8 flex items-center justify-between">
      <div className="text-gray-100 text-2xl font-black">
        <Link href="/" className="-space-y-2">
          <h1>SKILL</h1>
          <h1>BRIDGE.</h1>
        </Link>
      </div>
      <div className="text-gray-100 max-w-lg min-w-md">
        <SearchBar />
      </div>
      <div>
        <SignedOut>
          <Link href="/sign-up">
            <Button className="cursor-pointer bg-[#695DCC] hover:bg-[#695DCC]/80 font-bold">
              Sign Up
            </Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center gap-10">
            {dbUser?.role === "BUSINESS_OWNER" && (
              <div>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#695DCC] hover:bg-[#695DCC]/80 font-medium"
                >
                  <Plus className="h-5 w-5" />
                  Post a Project
                </Button>
                <PostProjectModal
                  open={isModalOpen}
                  onOpenChange={setIsModalOpen}
                />
              </div>
            )}

            <div className="relative pt-2">
              {totalUnrespondedApplications &&
                totalUnrespondedApplications > 0 && (
                  <div className="absolute top-0 -right-2 w-5 h-5 z-50 bg-red-400 rounded-full text-white font-bold text-xs flex items-center justify-center">
                    {totalUnrespondedApplications}
                  </div>
                )}
              <UserButton>
                <UserButton.UserProfilePage
                  label="Bio"
                  url="bio"
                  labelIcon={<ScanFace className="w-4 h-4" />}
                >
                  <UserInformation />
                </UserButton.UserProfilePage>
                {dbUser?.role === "USER" && (
                  <UserButton.UserProfilePage
                    label="Experience"
                    url="experience"
                    labelIcon={<BriefcaseBusiness className="w-4 h-4" />}
                  >
                    <UserExperience />
                  </UserButton.UserProfilePage>
                )}
                {dbUser?.role === "USER" && (
                  <UserButton.UserProfilePage
                    label="Education"
                    url="education"
                    labelIcon={<GraduationCap className="w-4 h-4" />}
                  >
                    <UserEducation />
                  </UserButton.UserProfilePage>
                )}
                {dbUser?.role === "USER" && (
                  <UserButton.UserProfilePage
                    label="Applications"
                    url="applications"
                    labelIcon={<ScrollText className="w-4 h-4" />}
                  >
                    <UserApplications />
                  </UserButton.UserProfilePage>
                )}
                {dbUser?.role === "BUSINESS_OWNER" && (
                  <UserButton.UserProfilePage
                    label="Posted Projects"
                    url="projects"
                    labelIcon={<FolderClock className="w-4 h-4" />}
                  >
                    <OrganizationPostedProjects />
                  </UserButton.UserProfilePage>
                )}
                {dbUser?.role === "BUSINESS_OWNER" && (
                  <UserButton.UserProfilePage
                    label="Applications"
                    url="applications"
                    labelIcon={<ScrollText className="w-4 h-4" />}
                  >
                    <OrganizationApplication />
                  </UserButton.UserProfilePage>
                )}
                <UserButton.UserProfileLink
                  url={`/profile/${dbUser?.clerkId}`}
                  label="Go to profile page"
                  labelIcon={<ArrowRight className="w-4 h-4" />}
                />
              </UserButton>
            </div>
          </div>
        </SignedIn>
      </div>
    </header>
  );
};

export default HeaderContent;
