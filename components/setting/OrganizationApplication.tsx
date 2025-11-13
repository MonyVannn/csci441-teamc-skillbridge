"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  LoaderCircle,
  FileText,
  Check,
  X,
  Search,
  MoreVertical,
} from "lucide-react";
import {
  approveApplication,
  getApplicationsForAllOwnerProjects,
  rejectApplication,
} from "@/lib/actions/application";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toast } from "sonner";
import { useClerkNavigation } from "@/lib/hooks/useClerkNavigation";

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
  const navigate = useClerkNavigation();
  const [applications, setApplications] = useState<
    ApplicationDetails[] | undefined
  >();
  const [filteredApplications, setFilteredApplications] = useState<
    ApplicationDetails[] | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<
    ApplicationDetails["status"][]
  >([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "ACCEPTED" | "REJECTED" | null;
    applicationId: string | null;
    applicantName: string | null;
  }>({
    open: false,
    action: null,
    applicationId: null,
    applicantName: null,
  });

  // Available status options
  const statusOptions: {
    value: ApplicationDetails["status"];
    label: string;
  }[] = [
    { value: "PENDING", label: "Pending" },
    { value: "ACCEPTED", label: "Accepted" },
    { value: "REJECTED", label: "Rejected" },
    { value: "WITHDRAWN", label: "Withdrawn" },
  ];

  useEffect(() => {
    async function loadAllApplications() {
      setIsLoading(true);
      try {
        // Fetch applications for all projects owned by the current user
        const data = await getApplicationsForAllOwnerProjects();
        const formattedData = data.map((app) => ({
          ...app,
          appliedAt: app.appliedAt.toISOString(),
        }));
        setApplications(formattedData);
        setFilteredApplications(formattedData);
      } catch (error) {
        console.error("Failed to load project applications:", error);
        toast.error("Failed to load applications. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAllApplications();
  }, []);

  // Filter applications based on search and status
  useEffect(() => {
    if (!applications) return;

    let filtered = applications;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (app) =>
          app.project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${app.applicant.firstName} ${app.applicant.lastName}`
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

    setFilteredApplications(filtered);
  }, [searchQuery, selectedStatuses, applications]);

  // Group applications by project title using useMemo for efficiency
  const groupedApplications = useMemo(() => {
    if (!filteredApplications) return {};
    return filteredApplications.reduce((acc, app) => {
      const { title } = app.project;
      if (!acc[title]) {
        acc[title] = [];
      }
      acc[title].push(app);
      return acc;
    }, {} as Record<string, ApplicationDetails[]>);
  }, [filteredApplications]);

  const toggleStatus = (status: ApplicationDetails["status"]) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const removeStatus = (status: ApplicationDetails["status"]) => {
    setSelectedStatuses((prev) => prev.filter((s) => s !== status));
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedStatuses([]);
  };

  const openConfirmDialog = (
    action: "ACCEPTED" | "REJECTED",
    applicationId: string,
    applicantName: string
  ) => {
    setConfirmDialog({
      open: true,
      action,
      applicationId,
      applicantName,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      action: null,
      applicationId: null,
      applicantName: null,
    });
  };

  const handleUpdateStatus = async () => {
    if (!confirmDialog.applicationId || !confirmDialog.action) return;

    const applicationId = confirmDialog.applicationId;
    const newStatus = confirmDialog.action;
    const originalApplications = applications;
    const originalFilteredApplications = filteredApplications;

    // Optimistic update for both states
    setApplications((prev) =>
      prev?.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );
    setFilteredApplications((prev) =>
      prev?.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );

    closeConfirmDialog();

    try {
      if (newStatus === "ACCEPTED") {
        await approveApplication(applicationId);
        toast.success("Application approved successfully!");
      } else {
        await rejectApplication(applicationId);
        toast.success("Application rejected successfully!");
      }
    } catch (error) {
      console.error(`Failed to update application status:`, error);
      toast.error(
        `Failed to ${
          newStatus === "ACCEPTED" ? "approve" : "reject"
        } application. Please try again.`
      );
      // Revert on error
      setApplications(originalApplications);
      setFilteredApplications(originalFilteredApplications);
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

  const totalApplications = filteredApplications?.length || 0;

  return (
    <div>
      <div className="space-y-1">
        <h1 className="font-bold text-gray-900">All Project Applications</h1>
        <p className="text-sm text-gray-500">
          Showing {totalApplications} of {applications?.length || 0} application
          {applications?.length !== 1 ? "s" : ""}
        </p>
      </div>
      <Separator className="my-5" />

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Search bar with dropdown menu */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by applicant name, project, or cover letter..."
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
                : "No applications have been received for any of your projects yet."}
            </p>
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {/* Map over the grouped projects */}
            {Object.entries(groupedApplications).map(
              ([projectTitle, projectApps]) => {
                const pendingCount = projectApps.filter(
                  (app) => app.status === "PENDING"
                ).length;

                return (
                  <AccordionItem
                    key={projectTitle}
                    value={projectTitle}
                    className="border rounded-lg bg-white px-4 last:border-b"
                  >
                    <AccordionTrigger className="hover:no-underline py-4 hover:cursor-pointer">
                      <div className="flex items-center gap-3 w-full">
                        <div className="flex items-center justify-between gap-3 flex-1">
                          <h2 className="font-semibold text-gray-800">
                            {projectTitle} ({projectApps.length})
                          </h2>
                          {pendingCount > 0 && (
                            <Badge className="bg-yellow-500 text-white hover:bg-yellow-500">
                              {pendingCount} pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                      <div className="space-y-3">
                        {/* Map over the applications for each project */}
                        {projectApps.map((app) => (
                          <div
                            key={app.id}
                            className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                          >
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                  <button
                                    type="button"
                                    aria-label={`View applicant ${app.applicant.firstName}`}
                                    onClick={() =>
                                      navigate(
                                        `/profile/${app.applicant.clerkId}`
                                      )
                                    }
                                    className="flex items-center gap-2 flex-wrap group cursor-pointer"
                                  >
                                    <Avatar className="rounded-lg">
                                      <AvatarImage
                                        src={app.applicant.imageUrl || ""}
                                        alt={`${
                                          app.applicant.firstName ?? ""
                                        } ${
                                          app.applicant.lastName ?? ""
                                        }`.trim()}
                                      />
                                      <AvatarFallback>
                                        {`${
                                          app.applicant.firstName?.[0] ?? ""
                                        }${
                                          app.applicant.lastName?.[0] ?? ""
                                        }`.toUpperCase() || "?"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <h3 className="font-semibold text-gray-900 group-hover:underline">
                                      {app.applicant.firstName}{" "}
                                      {app.applicant.lastName}
                                    </h3>
                                  </button>
                                  {app.status === "PENDING" && (
                                    <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          openConfirmDialog(
                                            "REJECTED",
                                            app.id,
                                            `${app.applicant.firstName} ${app.applicant.lastName}`
                                          )
                                        }
                                        className="w-1/2 sm:w-auto text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                      >
                                        <X className="mr-2 h-4 w-4" /> Reject
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          openConfirmDialog(
                                            "ACCEPTED",
                                            app.id,
                                            `${app.applicant.firstName} ${app.applicant.lastName}`
                                          )
                                        }
                                        className="w-1/2 sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        <Check className="mr-2 h-4 w-4" />{" "}
                                        Approve
                                      </Button>
                                    </div>
                                  )}
                                  {app.status !== "PENDING" && (
                                    <Badge
                                      className={getStatusBadgeVariant(
                                        app.status
                                      )}
                                    >
                                      {app.status.charAt(0) +
                                        app.status.slice(1).toLowerCase()}
                                    </Badge>
                                  )}
                                </div>
                                {app.coverLetter && (
                                  <div className="text-sm text-gray-700 ">
                                    <p className="whitespace-pre-line leading-relaxed">
                                      {app.coverLetter}
                                    </p>
                                  </div>
                                )}
                                <p className="text-xs text-gray-500">
                                  Applied on{" "}
                                  {format(
                                    new Date(app.appliedAt),
                                    "MMMM d, yyyy"
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              }
            )}
          </Accordion>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={closeConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === "ACCEPTED"
                ? "Approve Application"
                : "Reject Application"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === "ACCEPTED" ? (
                <>
                  Are you sure you want to approve{" "}
                  <span className="font-semibold">
                    {confirmDialog.applicantName}&apos;s
                  </span>{" "}
                  application? This will notify the applicant that they have
                  been accepted for this project.
                </>
              ) : (
                <>
                  Are you sure you want to reject{" "}
                  <span className="font-semibold">
                    {confirmDialog.applicantName}&apos;s
                  </span>{" "}
                  application? This action will notify the applicant of the
                  rejection.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateStatus}
              className={
                confirmDialog.action === "ACCEPTED"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {confirmDialog.action === "ACCEPTED" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
