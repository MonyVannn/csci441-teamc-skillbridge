"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import {
  Trash2,
  LoaderCircle,
  FileText,
  Search,
  MoreVertical,
  X,
  Calendar as CalendarIcon,
  Building2,
  ArrowLeft,
} from "lucide-react";
import {
  getApplicationsByUserId,
  withdrawApplication,
  markApplicationsAsSeen,
} from "@/lib/actions/application";
import { toast } from "sonner";
import { useClerkNavigation } from "@/lib/hooks/useClerkNavigation";
import { useRouter } from "next/navigation";
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

interface UserApplicationsProps {
  onApplicationsSeen?: () => void;
}

export function UserApplications({
  onApplicationsSeen,
}: UserApplicationsProps) {
  const navigate = useClerkNavigation();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[] | undefined>();
  const [filteredApplications, setFilteredApplications] = useState<
    Application[] | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<
    Application["status"][]
  >([]);
  const [applicationToWithdraw, setApplicationToWithdraw] = useState<
    string | null
  >(null);

  // Available status options
  const statusOptions: { value: Application["status"]; label: string }[] = [
    { value: "PENDING", label: "Pending" },
    { value: "ACCEPTED", label: "Accepted" },
    { value: "REJECTED", label: "Rejected" },
    { value: "WITHDRAWN", label: "Withdrawn" },
  ];

  useEffect(() => {
    async function loadApplications() {
      try {
        // Fetch application data from the server
        const data = await getApplicationsByUserId();
        // Format the data for display, converting dates to strings
        const formattedData = data.map((app) => ({
          ...app,
          appliedAt: app.appliedAt.toISOString(),
          project: {
            id: app.projectId,
            title: app.project.title,
            businessOwner: app.project.businessOwner,
          },
        }));
        setApplications(formattedData);
        setFilteredApplications(formattedData);
        // Mark all applications as seen when the user views this page
        await markApplicationsAsSeen();
        // Call the callback to update the parent component's state
        onApplicationsSeen?.();
      } catch (error) {
        console.error("Failed to load applications:", error);
        toast.error("Failed to load applications. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadApplications();
  }, [onApplicationsSeen]);

  // Filter and sort applications
  useEffect(() => {
    if (!applications) return;

    let filtered = applications;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (app) =>
          app.project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${app.project.businessOwner.firstName} ${app.project.businessOwner.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          app.coverLetter?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter (multiselect)
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((app) =>
        selectedStatuses.includes(app.status)
      );
    }

    // Sort: PENDING first, then by applied date (newest first)
    filtered = filtered.sort((a, b) => {
      // PENDING status goes first
      if (a.status === "PENDING" && b.status !== "PENDING") return -1;
      if (a.status !== "PENDING" && b.status === "PENDING") return 1;
      // Then sort by date (newest first)
      return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
    });

    setFilteredApplications(filtered);
  }, [searchQuery, selectedStatuses, applications]);

  const toggleStatus = (status: Application["status"]) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const removeStatus = (status: Application["status"]) => {
    setSelectedStatuses((prev) => prev.filter((s) => s !== status));
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedStatuses([]);
  };

  /**
   * Handles withdrawing an application. It optimistically updates the UI
   * by changing the application status to WITHDRAWN.
   */
  const handleWithdrawApplication = async (id: string) => {
    const originalApplications = applications;
    const originalFilteredApplications = filteredApplications;

    // Optimistically update the application status to WITHDRAWN
    setApplications(
      applications?.map((app) =>
        app.id === id ? { ...app, status: "WITHDRAWN" as const } : app
      )
    );
    setFilteredApplications(
      filteredApplications?.map((app) =>
        app.id === id ? { ...app, status: "WITHDRAWN" as const } : app
      )
    );

    try {
      await withdrawApplication(id);
      toast.success("Application withdrawn successfully!");
    } catch (e) {
      console.error("Failed to withdraw application: ", e);
      const errorMessage =
        e instanceof Error
          ? e.message
          : "Failed to withdraw application. Please try again.";
      toast.error(errorMessage);
      // If the API call fails, revert the change
      setApplications(originalApplications);
      setFilteredApplications(originalFilteredApplications);
    } finally {
      setApplicationToWithdraw(null);
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

  const totalApplications = filteredApplications?.length || 0;

  return (
    <div className="space-y-4">
      {/* Withdraw Confirmation Dialog */}
      <AlertDialog
        open={applicationToWithdraw !== null}
        onOpenChange={(open) => !open && setApplicationToWithdraw(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to withdraw this application? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                applicationToWithdraw &&
                handleWithdrawApplication(applicationToWithdraw)
              }
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div>
        <Button
          variant="ghost"
          className="mb-4 -ml-2"
          onClick={() => {
            router.push("/");
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
        <h1 className="text-3xl font-bold">Manage Incoming Applications</h1>
        <p className="text-muted-foreground mt-2">
          Showing {totalApplications} of {applications?.length || 0} application
          {applications?.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3">
        {/* Search bar with dropdown menu */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by project title, business owner, or cover letter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {statusOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={selectedStatuses.includes(option.value)}
                  onCheckedChange={() => toggleStatus(option.value)}
                  className="hover:cursor-pointer"
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
              {selectedStatuses.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="w-full justify-start text-xs"
                  >
                    Clear all filters
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Selected filters display */}
        {(selectedStatuses.length > 0 || searchQuery) && (
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {selectedStatuses.map((status) => {
                const option = statusOptions.find(
                  (opt) => opt.value === status
                );
                return (
                  <Badge
                    key={status}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {option?.label}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeStatus(status)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
            {(selectedStatuses.length > 0 || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-7 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Applications List */}
      <div>
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <LoaderCircle className="h-6 w-6 mx-auto mb-4 text-gray-300 animate-spin" />
            <p>Loading Applications</p>
          </div>
        ) : !filteredApplications || filteredApplications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No applications found</p>
            <p className="text-sm mt-1">
              {searchQuery || selectedStatuses.length > 0
                ? "Try adjusting your search or filters"
                : "You haven't applied to any projects yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="border rounded-lg p-4 bg-white hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Title and Status */}
                    <div className="flex items-start gap-2 flex-wrap justify-between">
                      <Link
                        href={`/project/${app.project.id}`}
                        className="font-medium hover:underline text-gray-900 flex-1 text-left"
                      >
                        {app.project.title}
                      </Link>
                      <Badge
                        variant="outline"
                        className={`border shrink-0 ${getStatusBadgeVariant(
                          app.status
                        )}`}
                      >
                        {app.status.charAt(0) +
                          app.status.slice(1).toLowerCase()}
                      </Badge>
                    </div>

                    {/* Cover Letter */}
                    {app.coverLetter && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {app.coverLetter}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {app.project.businessOwner.firstName}{" "}
                        {app.project.businessOwner.lastName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        Applied {format(new Date(app.appliedAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>

                  {/* Withdraw Button - Only for PENDING applications */}
                  {app.status === "PENDING" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setApplicationToWithdraw(app.id)}
                      className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
