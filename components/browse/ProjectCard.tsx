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
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface ProjectCardProps {
  projects: AvailableProject[];
  currentPageProp: number;
  totalPagesProp: number;
}

export function ProjectCard({
  projects,
  currentPageProp,
  totalPagesProp,
}: ProjectCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
          <Card
            key={project.id}
            className="overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="relative group">
              <Image
                src={"/placeholder.jpg"}
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
              <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-relaxed">
                {project.title}
              </h3>
              <div className="h-20 overflow-clip">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {project.description}
                </p>
              </div>

              <div className="flex items-center gap-1 mt-5 overflow-scroll">
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
                  <h3>Deadline {formatDate(project.applicationDeadline)}</h3>
                </div>
              </div>

              <Separator className="my-5" />

              {/* Seller Info */}
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={project.businessOwner.imageUrl || "/placeholder.svg"}
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
        ))}
      </div>
    </div>
  );
}
