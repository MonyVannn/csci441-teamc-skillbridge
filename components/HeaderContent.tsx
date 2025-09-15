"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  BriefcaseBusiness,
  GraduationCap,
  Plus,
  ScanFace,
  Search,
} from "lucide-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { UserExperience } from "./UserExperience";
import { UserEducation } from "./UserEducation";
import { UserInformation } from "./UserInformation";
import { PostProjectModal } from "./project/PostProjectModal";
import { User } from "@prisma/client";

interface HeaderContentProps {
  user: User;
}

const HeaderContent: React.FC<HeaderContentProps> = ({ user }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (pathname.startsWith("/sign-in")) return null;

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }

    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <header className="bg-[#121212] border-b py-4 px-8 flex items-center justify-between">
      <div className="text-gray-100 text-2xl font-black -space-y-2">
        <h1>SKILL</h1>
        <h1>BRIDGE.</h1>
      </div>
      <div className="text-gray-100 max-w-lg min-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search projects"
            className="pl-10 border-gray-100"
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams.get("query")?.toString()}
          />
        </div>
      </div>
      <div>
        <SignedOut>
          <Link href="/sign-in">
            <Button className="cursor-pointer bg-[#1DBF9F] hover:bg-[#1DBF9F]/80 font-bold">
              Sign Up
            </Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center gap-10">
            {user.role === "BUSINESS_OWNER" && (
              <div>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#1DBF9F] hover:bg-[#1DBF9F]/80 font-medium"
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

            <UserButton>
              <UserButton.UserProfilePage
                label="Bio"
                url="bio"
                labelIcon={<ScanFace className="w-4 h-4" />}
              >
                <UserInformation />
              </UserButton.UserProfilePage>
              <UserButton.UserProfilePage
                label="Experience"
                url="experience"
                labelIcon={<BriefcaseBusiness className="w-4 h-4" />}
              >
                <UserExperience />
              </UserButton.UserProfilePage>
              <UserButton.UserProfilePage
                label="Education"
                url="education"
                labelIcon={<GraduationCap className="w-4 h-4" />}
              >
                <UserEducation />
              </UserButton.UserProfilePage>
            </UserButton>
          </div>
        </SignedIn>
      </div>
    </header>
  );
};

export default HeaderContent;
