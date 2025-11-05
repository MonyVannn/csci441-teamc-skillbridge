"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LoaderCircle,
  Search,
  X,
  Briefcase,
  Calendar as CalendarIcon,
  MoreVertical,
} from "lucide-react";
import { ProjectStatus } from "@prisma/client";
import { getProjectsByOwnerId } from "@/lib/actions/project";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ProjectWithAssignedStudent } from "@/type";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { useClerkNavigation } from "@/lib/hooks/useClerkNavigation";
import Link from "next/link";

export function OrganizationPostedProjects() {
  const navigate = useClerkNavigation();
  const [projects, setProjects] = useState<ProjectWithAssignedStudent[]>();
  const [filteredProjects, setFilteredProjects] =
    useState<ProjectWithAssignedStudent[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<ProjectStatus[]>([]);

  // Available status options
  const statusOptions: { value: ProjectStatus; label: string }[] = [
    { value: "DRAFT", label: "Draft" },
    { value: "OPEN", label: "Open" },
    { value: "IN_REVIEW", label: "In Review" },
    { value: "ASSIGNED", label: "Assigned" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "ARCHIVED", label: "Archived" },
  ];

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjectsByOwnerId();
        setProjects(data);
        setFilteredProjects(data);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
  }, []);

  // Filter projects based on search and status
  useEffect(() => {
    if (!projects) return;

    let filtered = projects;

    // Hide archived projects by default unless specifically filtered
    if (
      selectedStatuses.length === 0 ||
      !selectedStatuses.includes("ARCHIVED")
    ) {
      filtered = filtered.filter((project) => project.status !== "ARCHIVED");
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter (multiselect)
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((project) =>
        selectedStatuses.includes(project.status)
      );
    }

    setFilteredProjects(filtered);
  }, [searchQuery, selectedStatuses, projects]);

  const toggleStatus = (status: ProjectStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const removeStatus = (status: ProjectStatus) => {
    setSelectedStatuses((prev) => prev.filter((s) => s !== status));
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedStatuses([]);
  };

  const getStatusColor = (status: ProjectStatus) => {
    const colors = {
      DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
      OPEN: "bg-blue-100 text-blue-700 border-blue-200",
      IN_REVIEW: "bg-yellow-100 text-yellow-700 border-yellow-200",
      ASSIGNED: "bg-purple-100 text-purple-700 border-purple-200",
      IN_PROGRESS: "bg-indigo-100 text-indigo-700 border-indigo-200",
      COMPLETED: "bg-green-100 text-green-700 border-green-200",
      CANCELLED: "bg-red-100 text-red-700 border-red-200",
      ARCHIVED: "bg-gray-100 text-gray-500 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status: ProjectStatus) => {
    return status.replace(/_/g, " ");
  };

  const totalProjects = filteredProjects?.length || 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-gray-900">Posted Projects</h1>
          <p className="text-sm text-gray-500 mt-1">
            Showing {totalProjects} of {projects?.length || 0} project
            {projects?.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <Separator className="my-5" />

      {/* Search and Filters */}
      <div className="flex flex-col gap-3">
        {/* Search bar with dropdown menu */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
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
            <div>
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
                className="h-7 text-xs mr-8"
              >
                Clear all
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Projects List - Card View (No horizontal scroll) */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">
          <LoaderCircle className="h-6 w-6 mx-auto mb-4 text-gray-300 animate-spin" />
          <p>Loading projects...</p>
        </div>
      ) : filteredProjects?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="font-medium">No projects found</p>
          <p className="text-sm mt-1">
            {searchQuery || selectedStatuses.length > 0
              ? "Try adjusting your search or filters"
              : "Click 'Create' to get started"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects?.map((project) => (
            <div
              key={project.id}
              className="border rounded-lg p-4 bg-white hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start gap-2 flex-wrap">
                    <button
                      type="button"
                      aria-label={`View project ${project.title}`}
                      onClick={() => navigate(`/project/${project.id}`)}
                      className="font-medium hover:underline text-gray-900 flex-1 text-left cursor-pointer"
                    >
                      {project.title}
                    </button>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border shrink-0",
                        getStatusColor(project.status)
                      )}
                    >
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {project.category.replace(/_/g, " ")}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {new Date(project.applicationDeadline).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                    <span>•</span>
                    <span className="font-medium text-gray-900">
                      ${project.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {project.requiredSkills.slice(0, 4).map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {project.requiredSkills.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.requiredSkills.length - 4}
                      </Badge>
                    )}
                  </div>
                  {project.assignedStudent && (
                    <button
                      type="button"
                      aria-label={`View project ${project.title}`}
                      onClick={() =>
                        navigate(`/profile/${project.assignedStudent?.clerkId}`)
                      }
                      className="flex items-center gap-2 hover:underline w-fit cursor-pointer"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarImage
                          src={project.assignedStudent.imageUrl || ""}
                        />
                        <AvatarFallback className="text-xs">
                          {project.assignedStudent.firstName?.[0]}
                          {project.assignedStudent.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-600">
                        Assigned to {project.assignedStudent.firstName}{" "}
                        {project.assignedStudent.lastName}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
