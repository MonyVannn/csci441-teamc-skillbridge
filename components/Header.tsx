"use client";
import React, { Suspense } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  BriefcaseBusiness,
  GraduationCap,
  ScanFace,
  Search,
} from "lucide-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { UserExperience } from "./UserExperience";
import { UserEducation } from "./UserEducation";
import { UserInformation } from "./UserInformation";

const sampleUserData = {
  imageUrl: "/professional-headshot.png",
  firstName: "Sarah",
  lastName: "Johnson",
  email: "sarah.johnson@example.com",
  bio: "Passionate software engineer with 5+ years of experience in full-stack development.",
  intro:
    "I'm a dedicated software engineer who loves building scalable web applications and mentoring junior developers. I specialize in React, Node.js, and cloud architecture.",
  address: "San Francisco, CA",
  role: "USER" as const,
  occupied: true,
  socialLinks: [
    { type: "LinkedIn", url: "https://linkedin.com/in/sarahjohnson" },
    { type: "GitHub", url: "https://github.com/sarahjohnson" },
    { type: "Website", url: "https://sarahjohnson.dev" },
  ],
  skills: ["React", "TypeScript", "Node.js", "Python", "AWS", "Docker"],
};

const HeaderContent = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();

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
            <Button className="cursor-pointer bg-[#1DBF9F] hover:bg-[#1DBF9F]/80 text-[#121212] text-lg font-bold">
              Sign Up
            </Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <UserButton>
            <UserButton.UserProfilePage
              label="Bio"
              url="bio"
              labelIcon={<ScanFace className="w-4 h-4" />}
            >
              <UserInformation initialData={sampleUserData} />
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
        </SignedIn>
      </div>
    </header>
  );
};

const Header = () => {
  return (
    <Suspense fallback={<div className="p-4 text-gray-400">Loading...</div>}>
      <HeaderContent />
    </Suspense>
  );
};

export default Header;
