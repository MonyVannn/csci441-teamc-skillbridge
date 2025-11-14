"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import {
  CalendarIcon,
  X,
  LoaderCircle,
  ArrowLeft,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormDescription,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { getUserByClerkId } from "@/lib/actions/user";
import {
  editProject,
  publishDraftProject,
  getProjectByProjectId,
} from "@/lib/actions/project";
import { Project, ProjectCategory, ProjectScope, User } from "@prisma/client";
import { toast } from "sonner";

const categories = Object.values(ProjectCategory);
const scopes = Object.values(ProjectScope);
const commonSkills = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "JavaScript",
  "HTML/CSS",
  "Vue.js",
  "Angular",
  "Express.js",
  "MongoDB",
];

const formSchema = z
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
      .array(z.string().min(1, "Responsibility cannot be empty"))
      .min(1, "At least one responsibility is required"),
    deliverables: z
      .array(z.string().min(1, "Deliverable cannot be empty"))
      .min(1, "At least one deliverable is required"),
    requiredSkills: z
      .array(z.string())
      .min(1, "At least one skill is required"),
    category: z.enum(categories, { error: "Category is required." }),
    scope: z.enum(scopes, { error: "Scope is required." }),
    startDate: z.date({
      error: (iss) =>
        iss.input == null ? "Start date is required" : "Invalid start date",
    }),
    estimatedEndDate: z.date({
      error: (iss) =>
        iss.input == null ? "End date is required" : "Invalid end date",
    }),
    applicationDeadline: z.date({
      error: (iss) =>
        iss.input == null
          ? "Application deadline is required"
          : "Invalid application deadline",
    }),

    budget: z.number().min(0, "Budget must be a positive number"),
  })
  .refine((data) => data.estimatedEndDate > data.startDate, {
    message: "End date must be after start date",
    path: ["estimatedEndDate"],
  })
  .refine((data) => data.applicationDeadline <= data.startDate, {
    message: "Application deadline must be before or on start date",
    path: ["applicationDeadline"],
  });

type FormData = z.infer<typeof formSchema>;

interface PageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function EditProjectPage({ params }: PageProps) {
  const router = useRouter();
  const user = useUser();
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLeaveAlert, setShowLeaveAlert] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );
  const [projectDateRange, setProjectDateRange] = useState<
    DateRange | undefined
  >(undefined);
  const [dbUser, setDbUser] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<Project>();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize form first
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      responsibilities: [""],
      deliverables: [""],
      requiredSkills: [],
      startDate: undefined,
      estimatedEndDate: undefined,
      applicationDeadline: undefined,
      budget: 0,
    },
  });

  // Fetch project and check access
  useEffect(() => {
    const fetchProjectAndCheckAccess = async () => {
      if (!user.isLoaded) return;

      if (!user.isSignedIn) {
        toast.error("Please sign in to access this page.");
        router.push("/sign-in");
        return;
      }

      try {
        const userData = await getUserByClerkId(user.user?.id);

        if (!userData) {
          toast.error("User not found.");
          router.push("/");
          return;
        }

        if (userData.role !== "BUSINESS_OWNER") {
          toast.error("Access denied. Only business owners can edit projects.");
          router.push("/");
          return;
        }

        setDbUser(userData);

        // Fetch project data using server action
        const { projectId } = await params;
        const projectData = await getProjectByProjectId(projectId);

        if (!projectData) {
          toast.error("Project not found.");
          router.push("/");
          return;
        }

        // Check if user is the owner
        if (projectData.businessOwnerId !== userData.id) {
          toast.error("Access denied. You can only edit your own projects.");
          router.push(`/project/${projectId}`);
          return;
        }

        setProject(projectData);

        // Pre-populate form with project data
        const responsibilities = projectData.responsibilities
          ? projectData.responsibilities
              .split("\n")
              .map((r: string) => r.replace(/^•\s*/, "").trim())
              .filter((r: string) => r)
          : [""];

        const deliverables = projectData.deliverables
          ? projectData.deliverables
              .split("\n")
              .map((d: string) => d.replace(/^•\s*/, "").trim())
              .filter((d: string) => d)
          : [""];

        const skills = projectData.requiredSkills || [];
        setSelectedSkills(skills);

        // Set the date range for the calendar component
        if (projectData.startDate && projectData.estimatedEndDate) {
          setProjectDateRange({
            from: new Date(projectData.startDate),
            to: new Date(projectData.estimatedEndDate),
          });
        }

        form.reset({
          title: projectData.title || "",
          description: projectData.description || "",
          responsibilities:
            responsibilities.length > 0 ? responsibilities : [""],
          deliverables: deliverables.length > 0 ? deliverables : [""],
          requiredSkills: skills,
          category: projectData.category,
          scope: projectData.scope,
          startDate: projectData.startDate
            ? new Date(projectData.startDate)
            : undefined,
          estimatedEndDate: projectData.estimatedEndDate
            ? new Date(projectData.estimatedEndDate)
            : undefined,
          applicationDeadline: projectData.applicationDeadline
            ? new Date(projectData.applicationDeadline)
            : undefined,
          budget: projectData.budget || 0,
        });

        // Reset unsaved changes flag after initial form population
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("An error occurred. Please try again.");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectAndCheckAccess();
  }, [user.isLoaded, user.isSignedIn, user.user?.id, router, params, form]);

  // Track form changes for unsaved changes alert
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Prevent browser close/refresh with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isSubmitting) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, isSubmitting]);

  const createProjectWithStatus = async (data: FormData, isDraft: boolean) => {
    if (!user.isSignedIn) {
      toast.error("You must be signed in to update a project.");
      return;
    }

    if (!dbUser || !project) {
      toast.error("Project or user data not found. Please try again.");
      return;
    }

    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);
    try {
      // Format responsibilities and deliverables as bullet points
      const formattedResponsibilities = data.responsibilities
        .filter((r) => r.trim() !== "")
        .map((r) => `• ${r}`)
        .join("\n");

      const formattedDeliverables = data.deliverables
        .filter((d) => d.trim() !== "")
        .map((d) => `• ${d}`)
        .join("\n");

      // Update the project in the database
      await editProject(
        {
          title: data.title,
          description: data.description,
          responsibilities: formattedResponsibilities,
          deliverables: formattedDeliverables,
          requiredSkills: data.requiredSkills,
          category: data.category,
          scope: data.scope,
          startDate: data.startDate,
          estimatedEndDate: data.estimatedEndDate,
          applicationDeadline: data.applicationDeadline,
          budget: data.budget,
          status: isDraft ? "DRAFT" : "OPEN",
          businessOwner: {
            connect: { id: dbUser.id },
          },
        },
        project.id
      );

      toast.success(
        isDraft
          ? "Project saved as draft successfully!"
          : "Project updated successfully!"
      );

      // Reset unsaved changes flag and navigate back to project
      setHasUnsavedChanges(false);
      router.push(`/project/${project.id}`);
    } catch (e) {
      console.error("Failed to update project, ", e);
      toast.error(
        isDraft
          ? "Failed to save project as draft. Please try again."
          : "Failed to update project. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (data: FormData) => {
    await createProjectWithStatus(data, false);
  };

  const handleSaveAsDraft = async () => {
    // Trigger form validation
    const isValid = await form.trigger();
    if (isValid) {
      const data = form.getValues();
      await createProjectWithStatus(data, true);
    } else {
      toast.error("Please fill in all required fields correctly.");
    }
  };

  const handlePublishDraft = async () => {
    if (!project || !dbUser) return;

    // If there are unsaved changes, validate and save them first
    if (hasUnsavedChanges) {
      const isValid = await form.trigger();
      if (!isValid) {
        toast.error("Please fix form errors before publishing.");
        return;
      }

      // Save the form changes before publishing
      const data = form.getValues();

      setIsSubmitting(true);
      try {
        // Format responsibilities and deliverables as bullet points
        const formattedResponsibilities = data.responsibilities
          .filter((r) => r.trim() !== "")
          .map((r) => `• ${r}`)
          .join("\n");

        const formattedDeliverables = data.deliverables
          .filter((d) => d.trim() !== "")
          .map((d) => `• ${d}`)
          .join("\n");

        // Update the project with changes
        await editProject(
          {
            title: data.title,
            description: data.description,
            responsibilities: formattedResponsibilities,
            deliverables: formattedDeliverables,
            requiredSkills: data.requiredSkills,
            category: data.category,
            scope: data.scope,
            startDate: data.startDate,
            estimatedEndDate: data.estimatedEndDate,
            applicationDeadline: data.applicationDeadline,
            budget: data.budget,
            status: "DRAFT",
            businessOwner: {
              connect: { id: dbUser.id },
            },
          },
          project.id
        );

        // Then publish the draft
        await publishDraftProject(project.id);
        toast.success("Changes saved and draft published successfully!");
        setHasUnsavedChanges(false);
        router.push(`/project/${project.id}`);
      } catch (e) {
        console.error("Failed to publish draft: ", e);
        toast.error("Failed to publish draft. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // No unsaved changes, just publish
      setIsSubmitting(true);
      try {
        await publishDraftProject(project.id);
        toast.success("Draft published successfully!");
        setHasUnsavedChanges(false);
        router.push(`/project/${project.id}`);
      } catch (e) {
        console.error("Failed to publish draft: ", e);
        toast.error("Failed to publish draft. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges && !isSubmitting) {
      setPendingNavigation(path);
      setShowLeaveAlert(true);
    } else {
      router.push(path);
    }
  };

  const confirmNavigation = () => {
    if (pendingNavigation) {
      setShowLeaveAlert(false);
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const cancelNavigation = () => {
    setShowLeaveAlert(false);
    setPendingNavigation(null);
  };

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !selectedSkills.includes(trimmedSkill)) {
      // Enforce 20 character limit
      if (trimmedSkill.length > 20) {
        toast.error("Each skill must be 20 characters or less.");
        form.setError("requiredSkills", {
          type: "manual",
          message: "Each skill must be 20 characters or less",
        });
        return;
      }
      form.clearErrors("requiredSkills");
      const newSkills = [...selectedSkills, trimmedSkill];
      setSelectedSkills(newSkills);
      form.setValue("requiredSkills", newSkills, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setSkillInput("");
    } else if (selectedSkills.includes(trimmedSkill)) {
      toast.warning("This skill has already been added.");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = selectedSkills.filter((s) => s !== skillToRemove);
    setSelectedSkills(newSkills);
    form.setValue("requiredSkills", newSkills, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill(skillInput.trim());
    }
  };

  const addResponsibility = () => {
    const current = form.getValues("responsibilities");
    form.setValue("responsibilities", [...current, ""], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const removeResponsibility = (index: number) => {
    const current = form.getValues("responsibilities");
    if (current.length > 1) {
      form.setValue(
        "responsibilities",
        current.filter((_, i) => i !== index),
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        }
      );
    }
  };

  const addDeliverable = () => {
    const current = form.getValues("deliverables");
    form.setValue("deliverables", [...current, ""], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const removeDeliverable = (index: number) => {
    const current = form.getValues("deliverables");
    if (current.length > 1) {
      form.setValue(
        "deliverables",
        current.filter((_, i) => i !== index),
        {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        }
      );
    }
  };

  // Show loading state while checking authentication
  if (isLoading || !user.isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <LoaderCircle className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authorized (will be redirected)
  if (!dbUser || dbUser.role !== "BUSINESS_OWNER") {
    return null;
  }

  return (
    <>
      <AlertDialog open={showLeaveAlert} onOpenChange={setShowLeaveAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave this
              page? All your progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelNavigation}>
              Continue Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmNavigation}>
              Leave Page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Header with Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              className="mb-4 -ml-2"
              onClick={() =>
                handleNavigation(project ? `/project/${project.id}` : "/")
              }
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Project
            </Button>
            <h1 className="text-3xl font-bold">Edit Project</h1>
            <p className="text-muted-foreground mt-2">
              Update your project details below.
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Basic Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Provide the essential details about your project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter project title"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your project in detail..."
                            className="min-h-[120px]"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isSubmitting}
                          >
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

                    <FormField
                      control={form.control}
                      name="scope"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scope *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isSubmitting}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select scope" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {scopes.map((scope) => (
                                <SelectItem key={scope} value={scope}>
                                  {scope}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              className="w-full"
                              {...field}
                              onChange={(e) =>
                                field.onChange(
                                  Number.parseFloat(e.target.value) || 0
                                )
                              }
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Requirements Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Requirements</CardTitle>
                  <CardDescription>
                    Define what you need from collaborators
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="responsibilities"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Responsibilities *</FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addResponsibility}
                            disabled={isSubmitting}
                            className="h-8"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                        <FormControl>
                          <div className="space-y-2">
                            {field.value.map((_, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  placeholder={`Responsibility ${index + 1}`}
                                  value={field.value[index]}
                                  onChange={(e) => {
                                    const newResponsibilities = [
                                      ...field.value,
                                    ];
                                    newResponsibilities[index] = e.target.value;
                                    field.onChange(newResponsibilities);
                                  }}
                                  disabled={isSubmitting}
                                  className="flex-1"
                                />
                                {field.value.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeResponsibility(index)}
                                    disabled={isSubmitting}
                                    className="flex-shrink-0"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Add each responsibility as a separate item
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliverables"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Deliverables *</FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addDeliverable}
                            disabled={isSubmitting}
                            className="h-8"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                        <FormControl>
                          <div className="space-y-2">
                            {field.value.map((_, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  placeholder={`Deliverable ${index + 1}`}
                                  value={field.value[index]}
                                  onChange={(e) => {
                                    const newDeliverables = [...field.value];
                                    newDeliverables[index] = e.target.value;
                                    field.onChange(newDeliverables);
                                  }}
                                  disabled={isSubmitting}
                                  className="flex-1"
                                />
                                {field.value.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeDeliverable(index)}
                                    disabled={isSubmitting}
                                    className="flex-shrink-0"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Add each deliverable as a separate item
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requiredSkills"
                    render={() => (
                      <FormItem>
                        <FormLabel>Required Skills *</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Type a skill and press Enter"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-1"
                                maxLength={20}
                                disabled={isSubmitting}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => addSkill(skillInput.trim())}
                                disabled={isSubmitting}
                              >
                                Add
                              </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {commonSkills.slice(0, 10).map((skill) => (
                                <Button
                                  key={skill}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addSkill(skill)}
                                  className="text-xs"
                                  disabled={isSubmitting}
                                >
                                  {skill}
                                </Button>
                              ))}
                            </div>

                            {selectedSkills.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {selectedSkills.map((skill) => (
                                  <Badge
                                    key={skill}
                                    variant="secondary"
                                    className="flex items-center gap-1 pr-1"
                                  >
                                    <span className="pl-1.5">{skill}</span>
                                    <Button
                                      variant={"ghost"}
                                      aria-label={`Remove ${skill}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeSkill(skill);
                                      }}
                                      className="inline-flex h-5 w-5 items-center justify-center rounded hover:bg-muted/70 focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </Button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Add skills required for this project. You can type
                          custom skills or click the suggested ones. Each skill
                          is limited to 20 characters.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Timeline Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Timeline</CardTitle>
                  <CardDescription>
                    Set important dates for your project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Project Duration - Range Calendar */}
                  <div>
                    <FormLabel className="mb-3 block">
                      Project Duration (Start - End Date) *
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !projectDateRange && "text-muted-foreground"
                          )}
                          disabled={isSubmitting}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {projectDateRange?.from ? (
                            projectDateRange.to ? (
                              <>
                                {format(projectDateRange.from, "LLL dd, y")} -{" "}
                                {format(projectDateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(projectDateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          defaultMonth={projectDateRange?.from}
                          selected={projectDateRange}
                          onSelect={(range) => {
                            setProjectDateRange(range);
                            if (range?.from) {
                              form.setValue("startDate", range.from, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              });
                            }
                            if (range?.to) {
                              form.setValue("estimatedEndDate", range.to, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              });
                            }
                          }}
                          numberOfMonths={2}
                          disabled={isSubmitting}
                          initialFocus
                          className="rounded-lg"
                        />
                      </PopoverContent>
                    </Popover>
                    {(form.formState.errors.startDate ||
                      form.formState.errors.estimatedEndDate) && (
                      <p className="text-sm font-medium text-destructive mt-2">
                        {form.formState.errors.startDate?.message ||
                          form.formState.errors.estimatedEndDate?.message}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      Select the start and end dates for your project
                    </p>
                  </div>

                  {/* Application Deadline */}
                  <FormField
                    control={form.control}
                    name="applicationDeadline"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Application Deadline *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal w-full",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={isSubmitting}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={isSubmitting}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                        <FormDescription>
                          Deadline for students to submit applications
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 pb-8">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                  onClick={() =>
                    handleNavigation(project ? `/project/${project.id}` : "/")
                  }
                >
                  Cancel
                </Button>
                <div className="flex flex-col sm:flex-row gap-3">
                  {project?.status === "DRAFT" ? (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleSaveAsDraft}
                        className="w-full sm:w-auto"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save as Draft"
                        )}
                      </Button>
                      <Button
                        type="button"
                        onClick={handlePublishDraft}
                        className="w-full sm:w-auto"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          "Publish Draft"
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleSaveAsDraft}
                        className="w-full sm:w-auto"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save as Draft"
                        )}
                      </Button>
                      <Button
                        type="submit"
                        className="w-full sm:w-auto"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Project"
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
