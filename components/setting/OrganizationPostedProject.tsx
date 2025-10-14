"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  Clock,
  SquareArrowOutUpRight,
} from "lucide-react";
import { Separator } from "../ui/separator";
import {
  Prisma,
  ProjectCategory,
  ProjectScope,
  ProjectStatus,
} from "@prisma/client";
import {
  createProject,
  deleteProject,
  editProject,
  getProjectsByOwnerId,
  publishDraftProject,
} from "@/lib/actions/project";
import { useUser } from "@clerk/nextjs";
import { getUserByClerkId } from "@/lib/actions/user";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ProjectWithAssignedStudent } from "@/type";
import Link from "next/link";

// Zod schema for form validation
const projectFormSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(100, "Title must be less than 100 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(1000, "Description must be less than 1000 characters"),
    responsibilities: z
      .string()
      .min(10, "Responsibilities must be at least 10 characters")
      .max(1000, "Responsibilities must be less than 1000 characters"),
    deliverables: z
      .string()
      .min(10, "Deliverables must be at least 10 characters")
      .max(1000, "Deliverables must be less than 1000 characters"),
    requiredSkills: z
      .array(z.string())
      .min(1, "At least one skill is required"),
    category: z.enum(ProjectCategory, {
      message: "Category is required",
    }),
    scope: z.enum(ProjectScope, {
      message: "Scope is required",
    }),
    startDate: z.string().min(1, "Start date is required"),
    estimatedEndDate: z.string().min(1, "End date is required"),
    applicationDeadline: z.string().min(1, "Application deadline is required"),
    budget: z.number().min(0, "Budget must be a positive number"),
    isPublic: z.boolean(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.estimatedEndDate);
      return end > start;
    },
    {
      message: "End date must be after start date",
      path: ["estimatedEndDate"],
    }
  )
  .refine(
    (data) => {
      const deadline = new Date(data.applicationDeadline);
      const start = new Date(data.startDate);
      return deadline <= start;
    },
    {
      message: "Application deadline must be before or on start date",
      path: ["applicationDeadline"],
    }
  );

type ProjectFormData = z.infer<typeof projectFormSchema>;

export function OrganizationPostedProjects() {
  const user = useUser();
  const [projects, setProjects] = useState<ProjectWithAssignedStudent[]>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [skillInput, setSkillInput] = useState("");
  const [editingProjectStatus, setEditingProjectStatus] =
    useState<ProjectStatus | null>(null);
  const categories = Object.values(ProjectCategory);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      responsibilities: "",
      deliverables: "",
      requiredSkills: [],
      category: undefined,
      scope: undefined,
      startDate: "",
      estimatedEndDate: "",
      applicationDeadline: "",
      budget: 0,
      isPublic: true,
    },
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
    form.reset({
      title: "",
      description: "",
      responsibilities: "",
      deliverables: "",
      requiredSkills: [],
      category: undefined,
      scope: undefined,
      startDate: "",
      estimatedEndDate: "",
      applicationDeadline: "",
      budget: 0,
      isPublic: true,
    });
    setSkillInput("");
    setIsAddingNew(true);
    setEditingId(null);
  };

  const handleEditProject = (project: ProjectWithAssignedStudent) => {
    form.reset({
      title: project.title,
      description: project.description,
      responsibilities: project.responsibilities || "",
      deliverables: project.deliverables || "",
      requiredSkills: project.requiredSkills,
      category: project.category,
      scope: project.scope,
      startDate: project.startDate.toISOString().split("T")[0],
      estimatedEndDate: project.estimatedEndDate.toISOString().split("T")[0],
      applicationDeadline: project.applicationDeadline
        .toISOString()
        .split("T")[0],
      budget: project.budget,
      isPublic: project.isPublic,
    });
    setSkillInput("");
    setEditingId(project.id);
    setEditingProjectStatus(project.status);
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

  const handlePublishDraft = async (projectId: string) => {
    try {
      await publishDraftProject(projectId);
      setProjects(
        projects?.map((project) =>
          project.id === projectId
            ? { ...project, status: "OPEN" as ProjectStatus, isPublic: true }
            : project
        )
      );
    } catch (e) {
      console.error("Failed to publish draft:", e);
    }
  };

  const saveProjectWithStatus = async (
    data: ProjectFormData,
    isDraft: boolean
  ) => {
    if (!user.isSignedIn) return;

    const dbUser = await getUserByClerkId(user.user.id);
    if (!dbUser) return;

    const projectData: Prisma.ProjectCreateInput = {
      title: data.title,
      description: data.description,
      responsibilities: data.responsibilities,
      deliverables: data.deliverables,
      requiredSkills: data.requiredSkills,
      category: data.category,
      scope: data.scope,
      startDate: new Date(data.startDate),
      estimatedEndDate: new Date(data.estimatedEndDate),
      applicationDeadline: new Date(data.applicationDeadline),
      budget: data.budget,
      businessOwner: { connect: { id: dbUser.id } },
      isPublic: isDraft ? false : data.isPublic,
      status: isDraft ? "DRAFT" : editingProjectStatus || "OPEN",
    };

    if (editingId) {
      try {
        const updatedProject = await editProject(projectData, editingId);
        setProjects(
          projects?.map((project) =>
            project.id === editingId
              ? { ...updatedProject, assignedStudent: project.assignedStudent }
              : project
          )
        );
      } catch (e) {
        console.error("Failed to edit project:", e);
      }
    } else {
      try {
        const newProject = await createProject(projectData);
        setProjects([
          {
            ...newProject,
            assignedStudent: null,
          } as ProjectWithAssignedStudent,
          ...(projects || []),
        ]);
      } catch (e) {
        console.error("Error adding new project:", e);
      }
    }

    handleCancel();
  };

  const handleSaveProject = async (data: ProjectFormData) => {
    await saveProjectWithStatus(data, false);
  };

  const handleSaveAsDraft = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const data = form.getValues();
      await saveProjectWithStatus(data, true);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingProjectStatus(null);
    setIsAddingNew(false);
    setSkillInput("");
    form.reset({
      title: "",
      description: "",
      responsibilities: "",
      deliverables: "",
      requiredSkills: [],
      category: undefined,
      scope: undefined,
      startDate: "",
      estimatedEndDate: "",
      applicationDeadline: "",
      budget: 0,
      isPublic: true,
    });
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      const currentSkills = form.getValues("requiredSkills");
      if (!currentSkills.includes(skillInput.trim())) {
        form.setValue("requiredSkills", [...currentSkills, skillInput.trim()]);
        setSkillInput("");
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues("requiredSkills");
    form.setValue(
      "requiredSkills",
      currentSkills.filter((skill) => skill !== skillToRemove)
    );
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
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSaveProject)}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              {editingId ? "Edit Project" : "Add New Project"}
            </h3>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
              >
                Cancel
              </Button>
              {(editingProjectStatus === "DRAFT" || isAddingNew) && (
                <Button
                  type="button"
                  onClick={handleSaveAsDraft}
                  variant="secondary"
                  size="sm"
                >
                  Save as Draft
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                className="bg-[#1DBF9F] hover:bg-[#1DBF9F]/80 text-white"
              >
                {editingProjectStatus === "DRAFT" ? "Publish" : "Save"}
              </Button>
            </div>
          </div>

          {/* Project Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Project Title
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. E-commerce Website Development"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Project Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Describe your project details and requirements..."
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Responsibilities */}
          <FormField
            control={form.control}
            name="responsibilities"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Applicant Responsibilities
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Describe the applicant's responsibilities..."
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Deliverables */}
          <FormField
            control={form.control}
            name="deliverables"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Project Deliverables
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Describe your project deliverables, goal, expectation..."
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Required Skills */}
          <FormField
            control={form.control}
            name="requiredSkills"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Required Skills
                </FormLabel>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
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
                  {field.value.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeSkill(skill)}
                    >
                      {skill} ×
                    </Badge>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Category
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="h-80">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.replaceAll("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Scope */}
            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Project Scope
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select scope" />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Budget */}
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Budget ($)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. 5000"
                      type="number"
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        field.onChange(Number.parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Start Date
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Estimated End Date
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="applicationDeadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Application Deadline
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
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
                            <div className="flex items-center gap-4">
                              <Link href={`/project/${project.id}`}>
                                <h3 className="font-semibold text-gray-900 line-clamp-1 hover:underline">
                                  {project.title}
                                </h3>
                              </Link>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={`text-xs ${getStatusColor(
                                  project.status
                                )}`}
                              >
                                {project.status.replace("_", " ")}
                              </Badge>
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

                        <p className="text-sm text-gray-600 leading-relaxed text-pretty line-clamp-3">
                          {project.description}
                        </p>

                        <div className="flex items-center gap-1 text-sm text-gray-600 font-semibold">
                          Budget: ${project.budget.toLocaleString()}
                        </div>

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
                        {project.assignedStudent &&
                          (project.status === "ASSIGNED" ||
                            project.status === "IN_PROGRESS" ||
                            project.status === "IN_REVIEW" ||
                            project.status === "COMPLETED") && (
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold">
                                Assigned to{" "}
                              </p>
                              <Link
                                href={`/profile/${project.assignedStudent.clerkId}`}
                              >
                                <Avatar className="w-8 h-8">
                                  <AvatarImage
                                    src={project.assignedStudent.imageUrl || ""}
                                    alt={
                                      project.assignedStudent.firstName || ""
                                    }
                                  />
                                  <AvatarFallback>
                                    {project.assignedStudent.firstName?.[0]}
                                    {project.assignedStudent.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                            </div>
                          )}
                      </div>

                      <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {project.status === "DRAFT" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePublishDraft(project.id)}
                            className="h-8 px-3 hover:bg-green-50 hover:text-green-600"
                            disabled={isAddingNew || editingId !== null}
                          >
                            <SquareArrowOutUpRight className="h-4 w-4 mr-1" />
                            Publish
                          </Button>
                        )}
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
