"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pencil,
  Trash2,
  Briefcase,
  CalendarIcon,
  LoaderCircle,
  DollarSign,
  Clock,
} from "lucide-react";
import { Separator } from "../ui/separator";
import {
  Prisma,
  Project,
  ProjectCategory,
  ProjectScope,
  ProjectStatus,
} from "@prisma/client";
import {
  createProject,
  deleteProject,
  editProject,
  getProjectsByOwnerId,
} from "@/lib/actions/project";
import { useUser } from "@clerk/nextjs";
import { getUserByClerkId } from "@/lib/actions/user";

export function UserPostedProjects() {
  const user = useUser();
  const [projects, setProjects] = useState<Project[]>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredSkills: [] as string[],
    skillInput: "",
    category: "" as ProjectCategory | "",
    scope: "" as ProjectScope | "",
    startDate: "",
    estimatedEndDate: "",
    applicationDeadline: "",
    budget: "",
    isPublic: true,
  });

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjectsByOwnerId();
        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
  }, []);

  const handleAddProject = () => {
    setFormData({
      title: "",
      description: "",
      requiredSkills: [],
      skillInput: "",
      category: "",
      scope: "",
      startDate: "",
      estimatedEndDate: "",
      applicationDeadline: "",
      budget: "",
      isPublic: true,
    });
    setIsAddingNew(true);
    setEditingId(null);
  };

  const handleEditProject = (project: Project) => {
    setFormData({
      title: project.title,
      description: project.description,
      requiredSkills: project.requiredSkills,
      skillInput: "",
      category: project.category,
      scope: project.scope,
      startDate: project.startDate.toISOString().split("T")[0],
      estimatedEndDate: project.estimatedEndDate.toISOString().split("T")[0],
      applicationDeadline: project.applicationDeadline
        .toISOString()
        .split("T")[0],
      budget: project.budget.toString(),
      isPublic: project.isPublic,
    });
    setEditingId(project.id);
    setIsAddingNew(false);
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      setProjects(projects?.filter((project) => project.id !== id));
    } catch (e) {
      console.error("Failed to delete project:", e);
    }
  };

  const handleSaveProject = async () => {
    if (!user.isSignedIn) return;

    const dbUser = await getUserByClerkId(user.user.id);
    if (!dbUser) return;

    const projectData: Prisma.ProjectCreateInput = {
      title: formData.title,
      description: formData.description,
      requiredSkills: formData.requiredSkills,
      category: formData.category as ProjectCategory,
      scope: formData.scope as ProjectScope,
      startDate: new Date(formData.startDate),
      estimatedEndDate: new Date(formData.estimatedEndDate),
      applicationDeadline: new Date(formData.applicationDeadline),
      budget: Number.parseFloat(formData.budget),
      businessOwner: { connect: { id: dbUser.id } },
      isPublic: formData.isPublic,
    };

    if (editingId) {
      try {
        const updatedProject = await editProject(projectData, editingId);
        setProjects(
          projects?.map((project) =>
            project.id === editingId ? updatedProject : project
          )
        );
      } catch (e) {
        console.error("Failed to edit project:", e);
      }
    } else {
      try {
        const newProject = await createProject(projectData);
        setProjects([newProject, ...(projects || [])]);
      } catch (e) {
        console.error("Error adding new project:", e);
      }
    }

    handleCancel();
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAddingNew(false);
    setFormData({
      title: "",
      description: "",
      requiredSkills: [],
      skillInput: "",
      category: "",
      scope: "",
      startDate: "",
      estimatedEndDate: "",
      applicationDeadline: "",
      budget: "",
      isPublic: true,
    });
  };

  const addSkill = () => {
    if (
      formData.skillInput.trim() &&
      !formData.requiredSkills.includes(formData.skillInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, prev.skillInput.trim()],
        skillInput: "",
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const start = startDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const end = endDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return `${start} - ${end}`;
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.OPEN:
        return "bg-green-100 text-green-700 border-green-200";
      case ProjectStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-700 border-blue-200";
      case ProjectStatus.COMPLETED:
        return "bg-gray-100 text-gray-700 border-gray-200";
      case ProjectStatus.CANCELLED:
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const renderProjectForm = () => (
    <div className="p-6 bg-[#1DBF9F]/5 border-l-4 border-[#1DBF9F]">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            {editingId ? "Edit Project" : "Add New Project"}
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveProject}
              size="sm"
              className="bg-[#1DBF9F] hover:bg-[#1DBF9F]/80 text-white"
              disabled={
                !formData.title ||
                !formData.description ||
                !formData.category ||
                !formData.scope ||
                !formData.startDate ||
                !formData.estimatedEndDate ||
                !formData.applicationDeadline ||
                !formData.budget
              }
            >
              Save
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Project Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-gray-700">
            Project Title
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="e.g. E-commerce Website Development"
            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label
            htmlFor="description"
            className="text-sm font-medium text-gray-700"
          >
            Project Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Describe your project requirements, goals, and expectations..."
            rows={4}
            className="border-gray-100 focus:border-blue-500 focus:ring-blue-500 resize-none bg-white"
          />
        </div>

        {/* Required Skills */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Required Skills
          </Label>
          <div className="flex gap-2">
            <Input
              value={formData.skillInput}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, skillInput: e.target.value }))
              }
              placeholder="Add a skill..."
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addSkill())
              }
            />
            <Button
              type="button"
              onClick={addSkill}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.requiredSkills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="bg-blue-100 text-blue-700 border-blue-200 cursor-pointer"
                onClick={() => removeSkill(skill)}
              >
                {skill} ×
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  category: value as ProjectCategory,
                }))
              }
            >
              <SelectTrigger className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ProjectCategory.WEB_DEVELOPMENT}>
                  Web Development
                </SelectItem>
                <SelectItem value={ProjectCategory.MOBILE_DEVELOPMENT}>
                  Mobile Development
                </SelectItem>
                <SelectItem value={ProjectCategory.DATA_SCIENCE}>
                  Data Science
                </SelectItem>
                <SelectItem value={ProjectCategory.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scope */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Project Scope
            </Label>
            <Select
              value={formData.scope}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  scope: value as ProjectScope,
                }))
              }
            >
              <SelectTrigger className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white">
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ProjectScope.BEGINNER}>
                  Small (1-2 weeks)
                </SelectItem>
                <SelectItem value={ProjectScope.INTERMEDIATE}>
                  Medium (1-2 months)
                </SelectItem>
                <SelectItem value={ProjectScope.ADVANCED}>
                  Large (3-6 months)
                </SelectItem>
                <SelectItem value={ProjectScope.EXPERT}>
                  Enterprise (6+ months)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label
              htmlFor="budget"
              className="text-sm font-medium text-gray-700"
            >
              Budget ($)
            </Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, budget: e.target.value }))
              }
              placeholder="e.g. 5000"
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Start Date
            </Label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Estimated End Date
            </Label>
            <Input
              type="date"
              value={formData.estimatedEndDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  estimatedEndDate: e.target.value,
                }))
              }
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Application Deadline
            </Label>
            <Input
              type="date"
              value={formData.applicationDeadline}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  applicationDeadline: e.target.value,
                }))
              }
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Public Project Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isPublic"
            checked={formData.isPublic}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isPublic: checked as boolean }))
            }
            className="border-gray-300 bg-white"
          />
          <Label
            htmlFor="isPublic"
            className="text-sm text-gray-700 cursor-pointer"
          >
            Make this project publicly visible
          </Label>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-bold text-gray-900 flex items-center gap-2">
            Posted Projects
          </h1>
        </div>
        <Button
          onClick={handleAddProject}
          variant="outline"
          className="mr-10 bg-transparent"
        >
          Add Project
        </Button>
      </div>
      <Separator className="my-5" />
      <div>
        {isAddingNew && renderProjectForm()}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <LoaderCircle className="h-6 w-6 mx-auto mb-4 text-gray-300 animate-spin" />
            <p>Loading</p>
          </div>
        ) : projects?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No projects posted yet</p>
            <p className="text-sm">
              Click &apos;Add Project&apos; to get started
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {projects?.map((project) => (
              <div key={project.id}>
                {editingId === project.id ? (
                  renderProjectForm()
                ) : (
                  <div className="py-6 px-2 hover:bg-gray-50 transition-colors duration-200 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 text-balance">
                              {project.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={`text-xs ${getStatusColor(
                                  project.status
                                )}`}
                              >
                                {project.status.replace("_", " ")}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <DollarSign className="h-4 w-4" />
                                <span>${project.budget.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {formatDateRange(
                                  project.startDate,
                                  project.estimatedEndDate
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              <span>
                                Apply by{" "}
                                {project.applicationDeadline.toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {project.category.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {project.scope} Project
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed text-pretty">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {project.requiredSkills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProject(project)}
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          disabled={isAddingNew || editingId !== null}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProject(project.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          disabled={isAddingNew || editingId !== null}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
