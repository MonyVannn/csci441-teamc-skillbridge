"use client";

import { Card } from "../ui/card";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { AvailableProject } from "@/type";
import { Separator } from "../ui/separator";
import { formatDate } from "@/lib/utils";
import { Button } from "../ui/button";
import { useCallback, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Dot,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { formatDistanceToNow } from "date-fns";
import { ApplyButton } from "../application/ApplyButton";
import { useUserAuth } from "@/lib/stores/userStore";
import { getCategoryThumbnail } from "@/lib/categoryThumbnails";
import { User } from "@prisma/client";
import { getUserByClerkId } from "@/lib/actions/user";
import Link from "next/link";

interface ProjectCardProps {
  projects: AvailableProject[];
  user: User | null;
  currentPageProp: number;
  totalPagesProp: number;
}

export function ProjectCard({
  projects,
  user,
  currentPageProp,
  totalPagesProp,
}: ProjectCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useUserAuth();

  useEffect(() => {
    router.push(`${pathname}?query=&page=1`);
  }, [router, pathname]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const handleNextPage = () => {
    if (currentPageProp === totalPagesProp) return;
    const newPage = currentPageProp + 1;

    const newQueryString = createQueryString("page", newPage.toString());
    router.push(`${pathname}?${newQueryString}`);
  };

  const handleEndPage = () => {
    if (currentPageProp === totalPagesProp) return;
    const newPage = totalPagesProp;

    const newQueryString = createQueryString("page", newPage.toString());
    router.push(`${pathname}?${newQueryString}`);
  };

  const handlePreviousPage = () => {
    if (currentPageProp === 1) return;
    const newPage = currentPageProp - 1;

    const newQueryString = createQueryString("page", newPage.toString());
    router.push(`${pathname}?${newQueryString}`);
  };

  const handleStartPage = () => {
    if (currentPageProp === 1) return;
    const newPage = 1;

    const newQueryString = createQueryString("page", newPage.toString());
    router.push(`${pathname}?${newQueryString}`);
  };

  return (
    <div className="container mx-auto">
      <div className="w-full flex items-center justify-between px-6 mt-5">
        <h1 className="font-bold text-lg">Available Projects</h1>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="rounded-none rounded-tl-lg rounded-bl-lg "
            onClick={handleStartPage}
            disabled={currentPageProp === 1}
          >
            <ChevronsLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-none border-l-0 border-t border-b border-r"
            onClick={handlePreviousPage}
            disabled={currentPageProp === 1}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <div className="px-4 py-[7px] text-sm border-t border-b">
            <span className="font-semibold">{currentPageProp}</span>
            <span className="text-muted-foreground"> / {totalPagesProp}</span>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="rounded-none border-r-0 border-t border-b border-l"
            onClick={handleNextPage}
            disabled={currentPageProp === totalPagesProp}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-none rounded-tr-lg rounded-br-lg"
            onClick={handleEndPage}
            disabled={currentPageProp === totalPagesProp}
          >
            <ChevronsRight className="h-8 w-8" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 p-6">
        {projects.map((project) => (
          <Sheet key={project.id}>
            <SheetTrigger className="text-left">
              <Card className="overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative group">
                  <Image
                    src={getCategoryThumbnail(project.category)}
                    alt={project.title}
                    width={1000}
                    height={1000}
                    className="w-full h-52 object-cover -mt-6"
                  />
                </div>

                {/* Card Content */}
                <div className="px-4 -mt-4">
                  <div className="mb-4 flex items-center gap-1">
                    <Badge className="bg-[#695DCC]">
                      {project.category.replaceAll("_", " ")}
                    </Badge>
                    <Badge className="bg-[#695DCC]">{project.scope}</Badge>
                  </div>
                  {/* Project Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-1 overflow-clip leading-relaxed">
                    {project.title}
                  </h3>
                  <div className="h-20 overflow-clip">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 mt-5 overflow-y-clip  overflow-x-scroll">
                    {project.requiredSkills.map((skill) => (
                      <Badge key={skill} variant={"outline"}>
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="mt-5">
                    <div className="text-sm">
                      <h3 className="font-bold text-gray-900 ">
                        ${project.budget} /{" "}
                        {project.startDate && project.estimatedEndDate
                          ? Math.ceil(
                              (new Date(project.estimatedEndDate).getTime() -
                                new Date(project.startDate).getTime()) /
                                (1000 * 3600 * 24)
                            ) + " days"
                          : "N/A"}
                      </h3>
                      <h3>
                        Deadline {formatDate(project.applicationDeadline)}
                      </h3>
                    </div>
                  </div>

                  <Separator className="my-5" />

                  {/* Seller Info */}
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={
                          project.businessOwner.imageUrl || "/placeholder.svg"
                        }
                      />
                      <AvatarFallback>
                        {project.businessOwner.firstName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold text-gray-900">
                      {project.businessOwner.firstName}{" "}
                      {project.businessOwner.lastName}
                    </span>
                  </div>
                  <h3 className="text-sm text-gray-500">
                    {formatDate(new Date(project.estimatedEndDate))}
                  </h3>
                </div>
              </Card>
            </SheetTrigger>
            <SheetContent className="min-w-[800px]">
              <SheetHeader>
                <SheetTitle>
                  <Link
                    href={`/profile/${project.businessOwner.clerkId}`}
                    className="group flex items-center gap-2 mb-2 cursor-pointer"
                  >
                    <Avatar className="h-10 w-10 rounded-none group-hover:scale-105 transition-transform">
                      <AvatarImage
                        src={
                          project.businessOwner.imageUrl || "/placeholder.svg"
                        }
                      />
                      <AvatarFallback>
                        {project.businessOwner.firstName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-gray-900 capitalize group-hover:underline transition-all">
                      {project.businessOwner.firstName}{" "}
                      {project.businessOwner.lastName}
                    </h3>
                  </Link>
                </SheetTitle>
                <div className="flex items-center justify-between">
                  <div>
                    <SheetDescription className="text-2xl font-bold text-gray-900 mt-2">
                      {project.title}
                    </SheetDescription>
                    <div className="flex items-center">
                      <SheetDescription className="font-medium">
                        {project.businessOwner.address}
                      </SheetDescription>
                      <Dot className="h-6 w-6 text-muted-foreground" />
                      <SheetDescription className="font-medium">
                        {formatDistanceToNow(new Date(project.createdAt), {
                          addSuffix: true,
                        })}
                      </SheetDescription>
                      <Dot className="h-6 w-6 text-muted-foreground" />
                      <SheetDescription className="font-medium">
                        {project.applications?.length} applicants
                      </SheetDescription>
                    </div>
                  </div>
                  {isAuthenticated && user?.role === "USER" && (
                    <ApplyButton project={project} />
                  )}
                </div>
              </SheetHeader>
              <div className="grid flex-1 auto-rows-min gap-6 overflow-y-auto px-4 pb-10">
                <h2 className="font-semibold text-xl text-gray-900">
                  About the project
                </h2>
                <div className="text-sm">
                  <h3 className="font-semibold text-gray-900">About Us</h3>
                  <p className="text-gray-900 mt-5 text-justify">
                    {project.businessOwner.bio}
                  </p>
                  <p className="text-gray-900 text-justify">
                    {project.businessOwner.intro}
                  </p>
                </div>
                <div className="text-sm">
                  <h3 className="font-semibold text-gray-900">Description</h3>
                  <p className="text-gray-900 mt-5 text-justify">
                    {project.description}
                  </p>
                </div>
                <div className="text-sm">
                  <h3 className="font-semibold text-gray-900">
                    Responsibilities
                  </h3>
                  <ul className="text-gray-900 mt-5 list-disc list-inside ml-4">
                    {project.responsibilities
                      ?.split(/-/)
                      .map((responsibility) => {
                        const cleanText = responsibility.trim();
                        return (
                          cleanText && ( // skip empty strings
                            <li key={cleanText}>{cleanText}</li>
                          )
                        );
                      })}
                  </ul>
                </div>
                <div className="text-sm">
                  <h3 className="font-semibold text-gray-900">Deliverables</h3>
                  <ul className="text-gray-900 mt-5 list-disc list-inside ml-4">
                    {project.deliverables?.split(/-/).map((deliverable) => {
                      const cleanText = deliverable.trim();
                      return (
                        cleanText && ( // skip empty strings
                          <li key={cleanText}>{cleanText}</li>
                        )
                      );
                    })}
                  </ul>
                </div>
                <div className="text-sm">
                  <h3 className="font-semibold text-gray-900">
                    Skills & Qualifications
                  </h3>
                  <p className="text-gray-900 mt-5">
                    To successfully complete this project, applicants should
                    demonstrate proficiency in the following areas:
                  </p>
                  <div className="w-[500px] space-y-1 mt-3">
                    {project.requiredSkills.map((skill) => (
                      <Badge key={skill} variant={"outline"} className="mr-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-sm">
                  <h3 className="font-semibold text-gray-900">Compensation</h3>
                  <p className="text-gray-900 mt-5 text-justify">
                    This project offers a budget of{" "}
                    <span className="font-semibold">${project.budget}</span>{" "}
                    provided by the business owner as compensation for
                    successful completion of the work. This amount is intended
                    to reflect the scope, timeline, and expected deliverables of
                    the project. The actual budget allocated may take into
                    consideration a variety of factors, including but not
                    limited to the complexity of the required skills, the
                    estimated time commitment, and the market value of similar
                    work.
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ))}
      </div>
    </div>
  );
}
