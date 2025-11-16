"use client";

import { Card } from "../ui/card";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { AvailableProject } from "@/type";
import { Separator } from "../ui/separator";
import { formatDate } from "@/lib/utils";
import { Button } from "../ui/button";
import { useCallback } from "react";
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
    <div className="container mx-auto px-2 sm:px-4 lg:px-6">
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 px-2 sm:px-6 mt-5">
        <h1 className="font-semibold text-base sm:text-lg">
          Available Projects
        </h1>
        <div className="hidden md:flex items-center">
          <Button
            variant="outline"
            size="icon"
            className="rounded-none rounded-tl-lg rounded-bl-lg h-8 w-8 "
            onClick={handleStartPage}
            disabled={currentPageProp === 1}
          >
            <ChevronsLeft className="h-4 w-4  lg:h-8 lg:w-8" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-none border-l-0 border-t border-b border-r h-8 w-8 "
            onClick={handlePreviousPage}
            disabled={currentPageProp === 1}
          >
            <ChevronLeft className="h-4 w-4  lg:h-8 lg:w-8" />
          </Button>

          <div className="px-2 flex items-center h-8 text-sm border-t border-b">
            <span className="font-semibold">{currentPageProp} </span>
            <span className="text-muted-foreground"> / {totalPagesProp}</span>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="rounded-none border-r-0 border-t border-b border-l h-8 w-8 "
            onClick={handleNextPage}
            disabled={currentPageProp === totalPagesProp}
          >
            <ChevronRight className="h-4 w-4  lg:h-8 lg:w-8" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-none rounded-tr-lg rounded-br-lg h-8 w-8 "
            onClick={handleEndPage}
            disabled={currentPageProp === totalPagesProp}
          >
            <ChevronsRight className="h-4 w-4  lg:h-8 lg:w-8" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-2 sm:p-4 lg:p-6">
        {projects.map((project) => (
          <Sheet key={project.id}>
            <SheetTrigger className="text-left" suppressHydrationWarning>
              <Card className="overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative group">
                  <Image
                    src={getCategoryThumbnail(project.category)}
                    alt={project.title}
                    width={600}
                    height={400}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="w-full h-40 sm:h-48 lg:h-52 object-cover -mt-6"
                  />
                </div>

                {/* Card Content */}
                <div className="px-3 sm:px-4 -mt-4">
                  <div className="mb-3 sm:mb-4 flex items-center gap-1 flex-wrap">
                    <Badge className="bg-[#695DCC] text-xs">
                      {project.category.replaceAll("_", " ")}
                    </Badge>
                    <Badge className="bg-[#695DCC] text-xs">
                      {project.scope}
                    </Badge>
                  </div>
                  {/* Project Title */}
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-1 overflow-clip leading-relaxed">
                    {project.title}
                  </h3>
                  <div className="h-16 sm:h-20 overflow-clip">
                    <p className="text-xs sm:text-sm text-gray-700 line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 mt-3 sm:mt-5 overflow-y-clip overflow-x-auto pb-2">
                    {project.requiredSkills.slice(0, 3).map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs capitalize"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {project.requiredSkills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.requiredSkills.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mt-3 sm:mt-5">
                    <div className="text-xs sm:text-sm">
                      <h3 className="font-bold text-gray-900">
                        ${project.budget} /{" "}
                        {project.startDate && project.estimatedEndDate
                          ? Math.ceil(
                              (new Date(project.estimatedEndDate).getTime() -
                                new Date(project.startDate).getTime()) /
                                (1000 * 3600 * 24)
                            ) + " days"
                          : "N/A"}
                      </h3>
                      <h3 className="text-xs">
                        Deadline {formatDate(project.applicationDeadline)}
                      </h3>
                    </div>
                  </div>

                  <Separator className="my-3 sm:my-5" />

                  {/* Seller Info */}
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage
                        src={
                          project.businessOwner.imageUrl || "/placeholder.svg"
                        }
                      />
                      <AvatarFallback className="text-xs">
                        {project.businessOwner.firstName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                      {project.businessOwner.firstName}{" "}
                      {project.businessOwner.lastName}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm text-gray-500 mb-2">
                    {formatDate(new Date(project.estimatedEndDate))}
                  </h3>
                </div>
              </Card>
            </SheetTrigger>
            <SheetContent className="w-full sm:min-w-[500px] md:min-w-[600px] lg:min-w-[800px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>
                  <Link
                    href={`/profile/${project.businessOwner.clerkId}`}
                    className="group flex items-center gap-2 mb-2 cursor-pointer"
                  >
                    <Avatar className="h-8 w-8 rounded-none group-hover:scale-105 transition-transform">
                      <AvatarImage
                        src={
                          project.businessOwner.imageUrl || "/placeholder.svg"
                        }
                      />
                      <AvatarFallback className="text-xs sm:text-base">
                        {project.businessOwner.firstName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 capitalize group-hover:underline transition-all">
                      {project.businessOwner.firstName}{" "}
                      {project.businessOwner.lastName}
                    </h3>
                  </Link>
                </SheetTitle>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="w-full sm:w-auto">
                    <SheetDescription className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-2">
                      {project.title}
                    </SheetDescription>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-0">
                      <SheetDescription className="font-medium text-xs sm:text-sm truncate">
                        {project.businessOwner.address}
                      </SheetDescription>
                      <Dot className="h-4 w-4  text-muted-foreground flex-shrink-0" />
                      <SheetDescription className="font-medium text-xs sm:text-sm whitespace-nowrap">
                        {formatDistanceToNow(new Date(project.createdAt), {
                          addSuffix: true,
                        })}
                      </SheetDescription>
                      <Dot className="h-4 w-4  text-muted-foreground flex-shrink-0" />
                      <SheetDescription className="font-medium text-xs sm:text-sm whitespace-nowrap">
                        {project.applications?.length} applicants
                      </SheetDescription>
                    </div>
                  </div>
                  {isAuthenticated && user?.role === "USER" && (
                    <div className="w-full sm:w-auto">
                      <ApplyButton project={project} />
                    </div>
                  )}
                </div>
              </SheetHeader>
              <div className="grid flex-1 auto-rows-min gap-4 sm:gap-6 overflow-y-auto px-2 sm:px-4 pb-6 sm:pb-10">
                <h2 className="font-semibold text-lg sm:text-xl text-gray-900">
                  About the project
                </h2>
                <div className="text-xs sm:text-sm">
                  <h3 className="font-semibold text-gray-900">About Us</h3>
                  <p className="text-gray-900 mt-3 sm:mt-5 text-justify">
                    {project.businessOwner.bio}
                  </p>
                  <p className="text-gray-900 text-justify">
                    {project.businessOwner.intro}
                  </p>
                </div>
                <div className="text-xs sm:text-sm">
                  <h3 className="font-semibold text-gray-900">Description</h3>
                  <p className="text-gray-900 mt-3 sm:mt-5 text-justify">
                    {project.description}
                  </p>
                </div>
                <div className="text-xs sm:text-sm">
                  <h3 className="font-semibold text-gray-900">
                    Responsibilities
                  </h3>
                  <ul className="text-gray-900 mt-3 sm:mt-5 list-disc list-inside ml-2 sm:ml-4">
                    {project.responsibilities
                      ?.split(/•/)
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
                <div className="text-xs sm:text-sm">
                  <h3 className="font-semibold text-gray-900">Deliverables</h3>
                  <ul className="text-gray-900 mt-3 sm:mt-5 list-disc list-inside ml-2 sm:ml-4">
                    {project.deliverables?.split(/•/).map((deliverable) => {
                      const cleanText = deliverable.trim();
                      return (
                        cleanText && ( // skip empty strings
                          <li key={cleanText}>{cleanText}</li>
                        )
                      );
                    })}
                  </ul>
                </div>
                <div className="text-xs sm:text-sm">
                  <h3 className="font-semibold text-gray-900">
                    Skills & Qualifications
                  </h3>
                  <p className="text-gray-900 mt-3 sm:mt-5">
                    To successfully complete this project, applicants should
                    demonstrate proficiency in the following areas:
                  </p>
                  <div className="w-full max-w-full sm:max-w-[500px] space-y-1 mt-3 flex flex-wrap gap-1">
                    {project.requiredSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant={"outline"}
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-xs sm:text-sm">
                  <h3 className="font-semibold text-gray-900">Compensation</h3>
                  <p className="text-gray-900 mt-3 sm:mt-5 text-justify">
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
      <div className="flex md:hidden w-full items-center justify-end">
        <Button
          variant="outline"
          size="icon"
          className="rounded-none rounded-tl-lg rounded-bl-lg h-8 w-8 "
          onClick={handleStartPage}
          disabled={currentPageProp === 1}
        >
          <ChevronsLeft className="h-4 w-4  lg:h-8 lg:w-8" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-none border-l-0 border-t border-b border-r h-8 w-8 "
          onClick={handlePreviousPage}
          disabled={currentPageProp === 1}
        >
          <ChevronLeft className="h-4 w-4 lg:h-8 lg:w-8" />
        </Button>

        <div className="px-2 flex items-center h-8 text-xs border-t border-b">
          <span className="font-semibold">{currentPageProp}</span>
          <span className="text-muted-foreground"> / {totalPagesProp}</span>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="rounded-none border-r-0 border-t border-b border-l h-8 w-8 "
          onClick={handleNextPage}
          disabled={currentPageProp === totalPagesProp}
        >
          <ChevronRight className="h-4 w-4  lg:h-8 lg:w-8" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-none rounded-tr-lg rounded-br-lg h-8 w-8 "
          onClick={handleEndPage}
          disabled={currentPageProp === totalPagesProp}
        >
          <ChevronsRight className="h-4 w-4  lg:h-8 lg:w-8" />
        </Button>
      </div>
    </div>
  );
}
