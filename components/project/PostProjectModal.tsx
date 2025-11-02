"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, X, LoaderCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { getUserByClerkId } from "@/lib/actions/user";
import { ProjectCategory, ProjectScope } from "@prisma/client";
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
  "PostgreSQL",
  "MySQL",
  "AWS",
  "Docker",
  "Kubernetes",
  "Git",
  "Figma",
  "Adobe XD",
  "Photoshop",
  "Machine Learning",
  "TensorFlow",
  "PyTorch",
  "Data Analysis",
  "SQL",
  "Blockchain",
  "Solidity",
  "Unity",
  "Unreal Engine",
  "C#",
  "Java",
  "Swift",
  "Kotlin",
  "Flutter",
  "React Native",
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

interface PostProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostProjectModal({
  open,
  onOpenChange,
}: PostProjectModalProps) {
  const user = useUser();
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      responsibilities: "",
      deliverables: "",
      requiredSkills: [],
      startDate: undefined,
      estimatedEndDate: undefined,
      applicationDeadline: undefined,
      budget: 0,
    },
  });

  const createProjectWithStatus = async (data: FormData, isDraft: boolean) => {
    if (!user.isSignedIn) {
      toast.error("You must be signed in to create a project.");
      return;
    }

    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);
    try {
      const dbUser = await getUserByClerkId(user.user?.id);

      if (!dbUser) {
        toast.error("User account not found. Please try again.");
        return;
      }

      toast.success(
        isDraft
          ? "Project saved as draft successfully!"
          : "Project posted successfully!"
      );

      // Reset form and close modal
      form.reset();
      setSelectedSkills([]);
      setSkillInput("");
      onOpenChange(false);
    } catch (e) {
      console.error("Failed to create a new project, ", e);
      toast.error(
        isDraft
          ? "Failed to save project as draft. Please try again."
          : "Failed to post project. Please try again."
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg sm:text-xl">
            Post a New Project
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Fill out the details below to post your project and find
            collaborators.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 sm:space-y-6"
          >
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
                      className="min-h-[100px]"
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
              name="responsibilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsibilities *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="- Describe applicant's responsibilities in detail..."
                      className="min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-sm text-muted-foreground -mt-4">
              Start a new responsibility with this dot (&apos;•&apos;)
            </p>

            <FormField
              control={form.control}
              name="deliverables"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deliverables *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="- Describe your deliverables in detail..."
                      className="min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-sm text-muted-foreground -mt-4">
              Start a new deliverable with this dot (&apos;•&apos;)
            </p>

            <FormField
              control={form.control}
              name="requiredSkills"
              render={() => (
                <FormItem>
                  <FormLabel>Required Skills *</FormLabel>
                  <FormControl>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a skill and press Enter"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1 text-sm"
                          maxLength={20}
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addSkill(skillInput.trim())}
                          className="px-3 sm:px-4"
                          disabled={isSubmitting}
                        >
                          Add
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {commonSkills.slice(0, 12).map((skill) => (
                          <Button
                            key={skill}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addSkill(skill)}
                            className="text-[10px] sm:text-xs px-2 py-1 h-auto"
                            disabled={isSubmitting}
                          >
                            {skill}
                          </Button>
                        ))}
                      </div>

                      {selectedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {selectedSkills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="flex items-center gap-0.5 sm:gap-1 pr-0.5 sm:pr-1 text-xs"
                            >
                              <span className="pl-1 sm:pl-1.5">{skill}</span>
                              <button
                                type="button"
                                aria-label={`Remove ${skill}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeSkill(skill);
                                }}
                                className="inline-flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded hover:bg-muted/70 focus:outline-none focus:ring-2 focus:ring-ring"
                              >
                                <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Add skills required for this project. You can type custom
                    skills or click the suggested ones. Each skill is limited to
                    20 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
              />{" "}
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
                          field.onChange(Number.parseFloat(e.target.value) || 0)
                        }
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-2 sm:pl-3 text-left font-normal text-xs sm:text-sm w-full",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isSubmitting}
                          >
                            {field.value ? (
                              <span className="truncate">
                                {format(field.value, "PPP")}
                              </span>
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-50 flex-shrink-0" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Estimated End Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-2 sm:pl-3 text-left font-normal text-xs sm:text-sm w-full",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isSubmitting}
                          >
                            {field.value ? (
                              <span className="truncate">
                                {format(field.value, "PPP")}
                              </span>
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-50 flex-shrink-0" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                              "pl-2 sm:pl-3 text-left font-normal text-xs sm:text-sm w-full",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isSubmitting}
                          >
                            {field.value ? (
                              <span className="truncate">
                                {format(field.value, "PPP")}
                              </span>
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-50 flex-shrink-0" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
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
                      Posting...
                    </>
                  ) : (
                    "Post Project"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
