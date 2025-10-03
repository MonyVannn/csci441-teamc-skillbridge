"use client";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { AvailableProject, TimelineEntry } from "@/type";
import { Dot } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ApplyButton } from "../application/ApplyButton";
import { Separator } from "../ui/separator";

interface ProjectDetailProps {
  project: AvailableProject;
  timeline: TimelineEntry[] | null;
}

export function ProjectDetail({ project, timeline }: ProjectDetailProps) {
  return (
    <div className="p-12 grid grid-cols-4 gap-8">
      <div className="col-span-3 w-full">
        <div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-10 w-10 rounded-none">
                <AvatarImage
                  src={project.businessOwner.imageUrl || "/placeholder.svg"}
                />
                <AvatarFallback>
                  {project.businessOwner.firstName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-gray-900 capitalize">
                {project.businessOwner.firstName}{" "}
                {project.businessOwner.lastName}
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                {project.title}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="font-medium">
                  {project.businessOwner.address}
                </div>
                <Dot className="h-6 w-6 text-muted-foreground" />
                <div className="font-medium">
                  {formatDistanceToNow(new Date(project.createdAt), {
                    addSuffix: true,
                  })}
                </div>
                <Dot className="h-6 w-6 text-muted-foreground" />
                <div className="font-medium">
                  {project.applications?.length} applicants
                </div>
              </div>
            </div>
            <ApplyButton project={project} />
          </div>
        </div>
        <div className="grid flex-1 auto-rows-min gap-6 overflow-y-auto pt-10">
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
            <h3 className="font-semibold text-gray-900">Responsibilities</h3>
            <ul className="text-gray-900 mt-5 list-disc list-inside ml-4">
              {project.responsibilities?.split(/-/).map((responsibility) => {
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
              <span className="font-semibold">${project.budget}</span> provided
              by the business owner as compensation for successful completion of
              the work. This amount is intended to reflect the scope, timeline,
              and expected deliverables of the project. The actual budget
              allocated may take into consideration a variety of factors,
              including but not limited to the complexity of the required
              skills, the estimated time commitment, and the market value of
              similar work.
            </p>
          </div>
        </div>
      </div>
      <div className="w-full border-l pl-6 relative">
        <Image
          src="/bg.jpeg"
          alt="bg"
          width={1920}
          height={1080}
          className="h-[100px] rounded-tl-lg rounded-tr-lg"
        />
        <Avatar className="absolute top-[72px] left-3 w-16 h-16 border-4 border-background">
          <AvatarImage src={project.assignedStudent?.imageUrl || ""} />
          <AvatarFallback className="text-2xl bg-muted">
            {project.assignedStudent?.firstName}
            {project.assignedStudent?.lastName}
          </AvatarFallback>
        </Avatar>
        <h1 className="absolute left-20 font-semibold text-lg">
          {project.assignedStudent?.firstName}{" "}
          {project.assignedStudent?.lastName}
        </h1>
        <div className="mt-10">
          <p className="text-sm text-muted-foreground">
            {project.assignedStudent?.bio}
          </p>
          <div className="mt-2">
            {project.assignedStudent?.skills?.map((skill) => (
              <Badge key={skill} variant={"outline"} className="mr-1">
                {skill}
              </Badge>
            ))}
          </div>
          <Separator className="my-5" />
          <section className="p-4 border rounded-xl shadow-md">
            <h1 className="text-lg font-semibold">
              {" "}
              {project.status.replace("_", " ")}
            </h1>
            <div className="w-full h-4 rounded-full bg-muted mt-1">
              <div
                className={`h-4 rounded-tl-full rounded-bl-full bg-[#695DCC] ${
                  project.status === "ASSIGNED"
                    ? "w-1/4"
                    : project.status === "IN_PROGRESS"
                    ? "w-1/2"
                    : project.status === "IN_REVIEW"
                    ? "w-3/4"
                    : project.status === "COMPLETED"
                    ? "w-full"
                    : "w-0"
                }`}
              />
            </div>
            <div className="bg-background mt-8">
              <h1 className="text-lg font-semibold">Project Timeline</h1>
              <div className="relative mx-auto max-w-4xl">
                <Separator
                  orientation="vertical"
                  className="bg-muted absolute left-1.5 top-4"
                />
                {timeline?.map((entry, index) => (
                  <div key={index} className="relative mb-10 pl-8">
                    <div className="bg-[#695DCC] absolute left-0 top-3.5 flex size-3 items-center justify-center rounded-full" />
                    <h4 className="rounded-xl pt-2 text-sm font-medium tracking-tight ">
                      {entry.title}
                    </h4>

                    <h5 className="text-sm text-muted-foreground ">
                      {entry.date}
                    </h5>

                    <div className="border-none shadow-none mt-2">
                      <div
                        className="prose dark:prose-invert text-foreground text-sm"
                        dangerouslySetInnerHTML={{ __html: entry.content }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
