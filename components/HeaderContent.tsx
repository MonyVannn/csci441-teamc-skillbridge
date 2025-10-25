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
  }, [isLoaded, clerkUser?.id]);

  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))
    return null;

  return (
    <header className="relative bg-[#121212] border-b py-3 px-4 sm:py-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
      {/* Logo - Hide text on mobile, show only on tablet+ */}
      <div className="text-gray-100 text-base sm:text-2xl font-bold md:font-black flex-shrink-0">
        <Link href="/" className="-space-y-1 sm:-space-y-2">
          <h1>SKILL</h1>
          <h1>BRIDGE.</h1>
        </Link>
      </div>

      {/* Search Bar - Responsive width */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block text-gray-100 max-w-40 md:max-w-[300px] lg:max-w-[500px] w-full">
        <SearchBar />
      </div>

      {/* Actions - Stack on small screens, hide text on mobile */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <SignedOut>
          <Link href={"/sign-in"} className="hidden md:block">
            <Button
              variant={"ghost"}
              className="text-white font-medium rounded-full hover:bg-[#695DCC]/40 hover:text-white"
            >
              Sign in
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="cursor-pointer bg-[#695DCC] hover:bg-[#695DCC]/80 font-semibold rounded-full text-xs sm:text-sm px-3 sm:px-4">
              <span>Get Started</span>
            </Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-10">
            {dbUser?.role === "BUSINESS_OWNER" && (
              <div>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center rounded-full gap-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-[#695DCC] hover:bg-[#695DCC]/80 font-semibold text-xs sm:text-sm"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Post a Project</span>
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
                  <div className="absolute top-0 -right-1 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 z-50 bg-red-400 rounded-full text-white font-bold text-[10px] sm:text-xs flex items-center justify-center">
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
                    labelIcon={
                      <>
                        <ScrollText className="w-4 h-4" />{" "}
                        {totalUnrespondedApplications &&
                        totalUnrespondedApplications > 0 ? (
                          <div className="absolute top-0 -right-28 w-4 h-4 z-50 bg-red-400 rounded-full text-white font-bold text-[10px] flex items-center justify-center">
                            {totalUnrespondedApplications}
                          </div>
                        ) : null}
                      </>
                    }
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
