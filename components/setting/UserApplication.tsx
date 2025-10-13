"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Trash2, LoaderCircle, FileText } from "lucide-react";
import {
  getApplicationsByUserId,
  withdrawApplication,
} from "@/lib/actions/application";
import Link from "next/link";

// Define the shape of the application data the component will work with
interface Application {
  id: string;
  project: {
    id: string;
    title: string;
    businessOwner: {
      firstName: string | null;
      lastName: string | null;
    };
  };
  coverLetter: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  appliedAt: string;
}

export function UserApplications() {
  const [applications, setApplications] = useState<Application[] | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      try {
        // Fetch application data from the server
        const data = await getApplicationsByUserId();
        // Format the data for display, converting dates to strings
        setApplications(
          data.map((app) => ({
            ...app,
            appliedAt: app.appliedAt.toISOString(),
            project: {
              id: app.projectId,
              title: app.project.title,
              businessOwner: app.project.businessOwner,
            },
          }))
        );
      } catch (error) {
        console.error("Failed to load applications:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadApplications();
  }, []);

  /**
   * Handles withdrawing an application. It optimistically updates the UI
   * by removing the application from the list before the API call completes.
   */
  const handleWithdrawApplication = async (id: string) => {
    const originalApplications = applications;
    // Optimistically remove the application from the UI
    setApplications(applications?.filter((app) => app.id !== id));

    try {
      await withdrawApplication(id);
    } catch (e) {
      console.error("Failed to withdraw application: ", e);
      // If the API call fails, revert the change
      setApplications(originalApplications);
    }
  };

  /**
   * Returns the appropriate Tailwind CSS classes for the application status badge.
   */
  const getStatusBadgeVariant = (status: Application["status"]) => {
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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-bold text-gray-900 flex items-center gap-2">
            My Applications
          </h1>
        </div>
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
            <p>You haven&apos;t applied to any projects yet.</p>
            <p className="text-sm">
              Find projects that interest you and submit an application.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {applications.map((app) => (
              <div
                key={app.id}
                className="py-6 px-2 hover:bg-gray-50 transition-colors duration-200 group"
              >
                <div className="flex items-baseline justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Link href={`/project/${app.project.id}`}>
                        <h3 className="font-semibold text-gray-900 text-balance hover:underline">
                          {app.project.title}
                        </h3>
                      </Link>
                      <Badge className={getStatusBadgeVariant(app.status)}>
                        {/* Capitalize first letter */}
                        {app.status.charAt(0) +
                          app.status.slice(1).toLowerCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {app.coverLetter || "No cover letter provided"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Posted by {app.project.businessOwner.firstName}{" "}
                      {app.project.businessOwner.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Applied on{" "}
                      {format(new Date(app.appliedAt), "MMMM d, yyyy")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleWithdrawApplication(app.id)}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      aria-label="Withdraw Application"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
