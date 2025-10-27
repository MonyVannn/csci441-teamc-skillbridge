"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Pencil,
  Trash2,
  Building2,
  CalendarIcon,
  LoaderCircle,
} from "lucide-react";
import { Separator } from "../ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createExperience,
  deleteExperience,
  editExperience,
  getExperience,
} from "@/lib/actions/user";
import { toast } from "sonner";

// Zod schema for experience form validation
const experienceFormSchema = z
  .object({
    title: z
      .string()
      .min(2, "Job title must be at least 2 characters")
      .max(200, "Job title must be less than 200 characters"),
    company: z
      .string()
      .min(2, "Company name must be at least 2 characters")
      .max(200, "Company name must be less than 200 characters"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional().nullable(),
    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .optional()
      .nullable(),
    isCurrentRole: z.boolean(),
  })
  .refine(
    (data) => {
      // If not current role, end date is required
      if (!data.isCurrentRole && !data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date is required unless this is your current role",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      // If both dates exist, end date should be after start date
      if (data.startDate && data.endDate && !data.isCurrentRole) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end >= start;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
}

export function UserExperience() {
  const [experiences, setExperiences] = useState<Experience[]>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
      isCurrentRole: false,
    },
  });

  const isCurrentRole = form.watch("isCurrentRole");

  useEffect(() => {
    async function loadExperiences() {
      try {
        const data = await getExperience();
        setExperiences(
          data.map((exp) => ({
            ...exp,
            startDate: exp.startDate.toISOString().split("T")[0],
            endDate: exp.endDate
              ? exp.endDate.toISOString().split("T")[0]
              : null,
          }))
        );
      } catch (error) {
        console.error("Failed to load experiences:", error);
        toast.error("Failed to load experiences. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadExperiences();
  }, []);

  // Reset end date when current role is checked
  useEffect(() => {
    if (isCurrentRole) {
      form.setValue("endDate", "");
    }
  }, [isCurrentRole, form]);

  const handleAddExperience = () => {
    form.reset({
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
      isCurrentRole: false,
    });
    setIsAddingNew(true);
    setEditingId(null);
  };

  const handleEditExperience = (experience: Experience) => {
    form.reset({
      title: experience.title,
      company: experience.company,
      startDate: experience.startDate,
      endDate: experience.endDate || "",
      description: experience.description || "",
      isCurrentRole: !experience.endDate,
    });
    setEditingId(experience.id);
    setIsAddingNew(false);
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      const user = await deleteExperience(id);
      console.log("Experience deleted, ", user);
      setExperiences(experiences?.filter((exp) => exp.id !== id));
      toast.success("Experience deleted successfully!");
    } catch (e) {
      console.error("Failed to delete user experience, ", e);
      toast.error("Failed to delete experience. Please try again.");
    }
  };

  const onSubmit = async (data: ExperienceFormValues) => {
    const experienceData = {
      title: data.title,
      company: data.company,
      startDate: data.startDate,
      endDate: data.isCurrentRole ? null : data.endDate || null,
      description: data.description || null,
    };

    try {
      if (editingId) {
        // Update existing experience
        const experienceToEdit = {
          ...experienceData,
          id: editingId,
          startDate: new Date(experienceData.startDate),
          endDate: experienceData.endDate
            ? new Date(experienceData.endDate)
            : null,
        };

        const user = await editExperience(experienceToEdit);
        console.log("Experience edited, ", user);

        setExperiences(
          experiences?.map((exp) =>
            exp.id === editingId
              ? {
                  ...experienceData,
                  id: editingId,
                  endDate: experienceData.endDate || null,
                }
              : exp
          )
        );
        toast.success("Experience updated successfully!");
      } else {
        // Add new experience
        const experienceToAdd = {
          ...experienceData,
          startDate: new Date(experienceData.startDate),
          endDate: experienceData.endDate
            ? new Date(experienceData.endDate)
            : null,
        };

        const user = await createExperience(experienceToAdd);
        console.log("Experience added, ", user);

        const newExperience: Experience = {
          ...experienceData,
          id: Date.now().toString(),
          endDate: experienceData.endDate || null,
        };
        setExperiences([newExperience, ...(experiences || [])]);
        toast.success("Experience added successfully!");
      }

      // Reset form and states
      handleCancel();
    } catch (e) {
      console.error("Failed to save experience: ", e);
      toast.error(
        editingId
          ? "Failed to update experience. Please try again."
          : "Failed to add experience. Please try again."
      );
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAddingNew(false);
    form.reset();
  };

  const formatDateRange = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
    const end = endDate
      ? new Date(endDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        })
      : "Present";
    return `${start} - ${end}`;
  };

  const renderExperienceForm = () => (
    <div className="p-6 bg-[#1DBF9F]/5 border-l-4 border-[#1DBF9F]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              {editingId ? "Edit Experience" : "Add New Experience"}
            </h3>
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                className="bg-[#1DBF9F] hover:bg-[#1DBF9F]/80 text-white"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
              >
                Cancel
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Job Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Job Title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Senior Software Engineer"
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company */}
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Company
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. TechCorp Inc."
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Start Date
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(new Date(field.value), "MM/dd/yyyy")
                            : "Select start date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(format(date, "yyyy-MM-dd"));
                          }
                        }}
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
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    End Date
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                          disabled={isCurrentRole}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value && !isCurrentRole
                            ? format(new Date(field.value), "MM/dd/yyyy")
                            : isCurrentRole
                            ? "Present"
                            : "Select end date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(format(date, "yyyy-MM-dd"));
                          }
                        }}
                        initialFocus
                        disabled={isCurrentRole}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Current Role Checkbox */}
          <FormField
            control={form.control}
            name="isCurrentRole"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-gray-300 bg-white"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm text-gray-700 cursor-pointer">
                    I currently work in this role
                  </FormLabel>
                </div>
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
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your role, responsibilities, and key achievements..."
                    rows={4}
                    className="border-gray-100 focus:border-blue-500 focus:ring-blue-500 resize-none bg-white"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-bold text-gray-900 flex items-center gap-2">
            Experiences
          </h1>
        </div>
        <Button
          onClick={handleAddExperience}
          variant={"outline"}
          className="mr-10"
        >
          Add Experience
        </Button>
      </div>
      <Separator className="my-5" />
      <div>
        {isAddingNew && renderExperienceForm()}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <LoaderCircle className="h-6 w-6 mx-auto mb-4 text-gray-300 animate-spin" />
            <p>Loading</p>
          </div>
        ) : experiences?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No experiences added yet</p>
            <p className="text-sm">
              Click &apos;Add Experience&apos; to get started
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {experiences?.map((experience) => (
              <div key={experience.id}>
                {editingId === experience.id ? (
                  renderExperienceForm()
                ) : (
                  <div className="py-6 px-2 hover:bg-gray-50 transition-colors duration-200 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-gray-900 text-balance">
                            {experience.title}
                          </h3>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-700">
                              {experience.company}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              {!experience.endDate && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-blue-100 text-blue-700 border-blue-200"
                                >
                                  Current
                                </Badge>
                              )}
                              <span>
                                {formatDateRange(
                                  experience.startDate,
                                  experience.endDate
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed text-pretty">
                          {experience.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditExperience(experience)}
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          disabled={isAddingNew || editingId !== null}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExperience(experience.id)}
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
