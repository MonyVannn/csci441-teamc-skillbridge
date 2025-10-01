"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Trash2, LoaderCircle, FileText } from "lucide-react";
import {
  getApplicationsByUserId,
  withdrawApplication,
} from "@/lib/actions/application";

// Define the shape of the application data the component will work with
interface Application {
  id: string;
  project: {
    title: string;
    status: string;
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
  const [groupBy, setGroupBy] = useState<"none" | "status">("status");

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
              title: app.project.title,
              status: app.project.status,
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

  // Group applications by project status using useMemo for efficiency
  const groupedByStatus = useMemo(() => {
    if (!applications) return {};
    return applications.reduce((acc, app) => {
      const status = app.project.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(app);
      return acc;
    }, {} as Record<string, Application[]>);
  }, [applications]);

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

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-700 border-green-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "COMPLETED":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      case "ASSIGNED":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "IN_REVIEW":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "ARCHIVED":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatProjectStatus = (status: string) => {
    return status.replace(/_/g, " ");
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
      
      {/* Group By Selector */}
      {!isLoading && applications && applications.length > 0 && (
        <div className="mb-6 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Group by:</label>
          <Select value={groupBy} onValueChange={(value: "none" | "status") => setGroupBy(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Project Status</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

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
        ) : groupBy === "status" ? (
          <div className="space-y-8">
            {/* Grouped by status view */}
            {Object.entries(groupedByStatus).map(([status, statusApps]) => (
              <div key={status}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="font-bold text-xl text-gray-800">
                    {formatProjectStatus(status)}
                  </h2>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getProjectStatusColor(status)}`}
                  >
                    {statusApps.length} {statusApps.length === 1 ? "application" : "applications"}
                  </Badge>
                </div>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
                  {statusApps.map((app) => (
                    <div
                      key={app.id}
                      className="py-6 px-4 hover:bg-gray-50 transition-colors duration-200 group"
                    >
                      <div className="flex items-baseline justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 text-balance">
                              {app.project.title}
                            </h3>
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
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Flat list view */}
            {applications.map((app) => (
              <div
                key={app.id}
                className="py-6 px-2 hover:bg-gray-50 transition-colors duration-200 group"
              >
                <div className="flex items-baseline justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-balance">
                          {app.project.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getProjectStatusColor(
                            app.project.status
                          )}`}
                        >
                          {formatProjectStatus(app.project.status)}
                        </Badge>
                      </div>
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
