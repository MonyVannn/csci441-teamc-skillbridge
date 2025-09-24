import { Card } from "../ui/card";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { AvailableProject } from "@/type";
import { Separator } from "../ui/separator";
import { formatDate } from "@/lib/utils";

interface ProjectCardProps {
  projects: AvailableProject[];
}

export function ProjectCard({ projects }: ProjectCardProps) {
  return (
    <div className="grid grid-cols-3 gap-4 p-6 container mx-auto">
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
  );
}
