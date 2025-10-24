"use client";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { AvailableProject, TimelineEntry } from "@/type";
import { Archive, Dot, Pencil } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ApplyButton } from "../application/ApplyButton";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useEffect, useState } from "react";
import { updateProjectStatus, deleteProject } from "@/lib/actions/project";
import { useUser } from "@clerk/nextjs";
import { ProjectStatus, User } from "@prisma/client";
import { EditProjectModal } from "./EditProjectModal";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/actions/user";

interface ProjectDetailProps {
  project: AvailableProject;
  timeline: TimelineEntry[] | null;
}

export function ProjectDetail({ project, timeline }: ProjectDetailProps) {
  const { user } = useUser();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ProjectStatus | null>(
    null
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [dbUser, setDbUser] = useState<User>();

  const isOwner = user?.id === project.businessOwner.clerkId;

  useEffect(() => {
    const fetchUser = async () => {
      if (user?.id && !dbUser) {
        try {
          const userData = await getUser();
          setDbUser(userData);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
    };

    fetchUser();
  }, [user?.id, dbUser]);

  const getStatusChangeMessage = () => {
    switch (project.status) {
      case "ASSIGNED":
        return {
          title: "Begin the Project",
          description:
            "You are about to begin working on this project. The project status will be changed to 'In Progress'. Are you ready to start?",
          buttonText: "Begin Project",
          nextStatus: "IN_PROGRESS",
        };
      case "IN_PROGRESS":
        return {
          title: "Begin Reviewing Process",
          description:
            "You are about to submit your work for review. The project status will be changed to 'In Review'. Make sure all deliverables are completed.",
          buttonText: "Submit for Review",
          nextStatus: "IN_REVIEW",
        };
      default:
        return null;
    }
  };

  const handleStatusChangeClick = () => {
    const statusInfo = getStatusChangeMessage();
    if (statusInfo) {
      setPendingStatus(statusInfo.nextStatus as ProjectStatus);
      setIsDialogOpen(true);
    }
  };

  const handleMarkAsCompleted = async () => {
    setIsUpdating(true);
    try {
      await updateProjectStatus(project.id, "COMPLETED");
      setIsDialogOpen(false);
      setPendingStatus(null);
    } catch (error) {
      console.error("Failed to update project status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatus) return;

    setIsUpdating(true);
    try {
      await updateProjectStatus(project.id, pendingStatus);
      setIsDialogOpen(false);
      setPendingStatus(null);
    } catch (error) {
      console.error("Failed to update project status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelStatusChange = () => {
    setIsDialogOpen(false);
    setPendingStatus(null);
  };

  const handleArchiveProject = async () => {
    setIsUpdating(true);
    try {
      await deleteProject(project.id);
      console.log("Project archived successfully");
      setIsArchiveDialogOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Failed to archive project:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const statusInfo = getStatusChangeMessage();

  return (
    <div className="p-12 grid grid-cols-4 gap-8">
      <div
        className={`${
          project.assignedStudent ? "col-span-3" : "col-span-4"
        } w-full`}
      >
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
            <div className="flex items-center gap-2">
              {isOwner && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsArchiveDialogOpen(true)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                </>
              )}
              {!isOwner &&
                (dbUser === undefined ? (
                  // Loading skeleton for Apply button
                  <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
                ) : (
                  dbUser.role === "USER" && <ApplyButton project={project} />
                ))}
            </div>
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
      {project.assignedStudent && (
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
                      ? "w-full rounded-full"
                      : "w-0"
                  }`}
                />
              </div>
              {user?.id === project.assignedStudent?.clerkId && statusInfo && (
                <Button
                  size={"sm"}
                  variant={"outline"}
                  className="w-full rounded-full mt-5"
                  onClick={handleStatusChangeClick}
                >
                  {statusInfo.buttonText}
                </Button>
              )}
              {user?.id === project.businessOwner.clerkId &&
                project.status === "IN_REVIEW" && (
                  <Button
                    size={"sm"}
                    variant={"outline"}
                    className="w-full rounded-full mt-5"
                    onClick={handleMarkAsCompleted}
                  >
                    Mark as completed
                  </Button>
                )}
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
      )}

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{statusInfo?.title}</DialogTitle>
            <DialogDescription>{statusInfo?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelStatusChange}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStatusChange}
              disabled={isUpdating}
              className="bg-[#695DCC] hover:bg-[#695DCC]/80"
            >
              {isUpdating ? "Updating..." : statusInfo?.buttonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this project? This action will
              mark the project as archived and it will no longer be visible to
              applicants. You can view archived projects in your settings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsArchiveDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleArchiveProject}
              disabled={isUpdating}
              variant="destructive"
            >
              {isUpdating ? "Archiving..." : "Archive Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Modal */}
      {isOwner && (
        <EditProjectModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          project={project}
        />
      )}
    </div>
  );
}
