"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  LoaderCircle,
  FileText,
  Check,
  X,
  FolderKanban,
  SquareArrowOutUpRight,
} from "lucide-react";
import {
  approveApplication,
  getApplicationsForAllOwnerProjects,
  rejectApplication,
} from "@/lib/actions/application";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

// Updated interface to include project details for each application
interface ApplicationDetails {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  appliedAt: string;
  coverLetter: string | null;
  applicant: {
    id: string;
    clerkId: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  project: {
    id: string;
    title: string;
  };
}

export function OrganizationApplication() {
  const [applications, setApplications] = useState<
    ApplicationDetails[] | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAllApplications() {
      setIsLoading(true);
      try {
        // Fetch applications for all projects owned by the current user
        const data = await getApplicationsForAllOwnerProjects();
        setApplications(
          data.map((app) => ({
            ...app,
            appliedAt: app.appliedAt.toISOString(),
          }))
        );
      } catch (error) {
        console.error("Failed to load project applications:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAllApplications();
  }, []);

  // Group applications by project title using useMemo for efficiency
  const groupedApplications = useMemo(() => {
    if (!applications) return {};
    return applications.reduce((acc, app) => {
      const { title } = app.project;
      if (!acc[title]) {
        acc[title] = [];
      }
      acc[title].push(app);
      return acc;
    }, {} as Record<string, ApplicationDetails[]>);
  }, [applications]);

  const handleUpdateStatus = async (
    applicationId: string,
    newStatus: "ACCEPTED" | "REJECTED"
  ) => {
    const originalApplications = applications;
    const app = applications?.find((app) => app.id === applicationId);

    setApplications((prev) =>
      prev?.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );

    try {
      if (newStatus === "ACCEPTED" && app) {
        await approveApplication(applicationId);
      } else {
        await rejectApplication(applicationId);
      }
    } catch (error) {
      console.error(`Failed to update application status:`, error);
      setApplications(originalApplications);
    }
  };

  const getStatusBadgeVariant = (status: ApplicationDetails["status"]) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100";
      case "WITHDRAWN":
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100";
      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100";
    }
  };

  return (
    <div>
      <div className="space-y-1">
        <h1 className="font-bold text-gray-900">All Project Applications</h1>
        <p className="text-sm text-gray-500">
          Review and manage all applications submitted to your projects.
        </p>
      </div>
      <Separator className="my-5" />
      <div>
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <LoaderCircle className="h-6 w-6 mx-auto mb-4 text-gray-300 animate-spin" />
            <p>Loading Applications</p>
          </div>
        ) : !applications || applications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>
              No applications have been received for any of your projects yet.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Map over the grouped projects */}
            {Object.entries(groupedApplications).map(
              ([projectTitle, projectApps]) => (
                <div key={projectTitle}>
                  <div className="flex items-center gap-3 mb-4">
                    <FolderKanban className="h-6 w-6 text-gray-700" />
                    <h2 className="font-bold text-xl text-gray-800">
                      {projectTitle}
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {/* Map over the applications for each project */}
                    {projectApps.map((app) => (
                      <div
                        key={app.id}
                        className="p-4 border border-gray-200 rounded-lg bg-white ml-2"
                      >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Avatar className="rounded-lg">
                                  <AvatarImage
                                    src={app.applicant.imageUrl || ""}
                                    alt="@evilrabbit"
                                  />
                                  <AvatarFallback>ER</AvatarFallback>
                                </Avatar>
                                <h3 className="font-semibold text-gray-900">
                                  {app.applicant.firstName}{" "}
                                  {app.applicant.lastName}
                                </h3>
                                <Link
                                  href={`/profile/${app.applicant.clerkId}`}
                                >
                                  <Button size={"icon"} variant={"ghost"}>
                                    <SquareArrowOutUpRight className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </div>
                              {app.status === "PENDING" && (
                                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateStatus(app.id, "REJECTED")
                                    }
                                    className="w-1/2 sm:w-auto text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                  >
                                    <X className="mr-2 h-4 w-4" /> Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateStatus(app.id, "ACCEPTED")
                                    }
                                    className="w-1/2 sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <Check className="mr-2 h-4 w-4" /> Approve
                                  </Button>
                                </div>
                              )}
                              {app.status !== "PENDING" && (
                                <Badge
                                  className={getStatusBadgeVariant(app.status)}
                                >
                                  {app.status.charAt(0) +
                                    app.status.slice(1).toLowerCase()}
                                </Badge>
                              )}
                            </div>
                            {app.coverLetter && (
                              <div className="text-sm text-gray-600 border-l-2 border-gray-200 pl-3 italic">
                                <p>{app.coverLetter}</p>
                              </div>
                            )}
                            <p className="text-xs text-gray-500">
                              Applied on{" "}
                              {format(new Date(app.appliedAt), "MMMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
