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
  GraduationCap,
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
  createEducation,
  deleteEducation,
  editEducation,
  getEducation,
} from "@/lib/actions/user";
import { toast } from "sonner";

// Zod schema for education form validation
const educationFormSchema = z
  .object({
    degree: z
      .string()
      .min(2, "Degree must be at least 2 characters")
      .max(200, "Degree must be less than 200 characters"),
    institution: z
      .string()
      .min(2, "Institution must be at least 2 characters")
      .max(200, "Institution must be less than 200 characters"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional().nullable(),
    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .optional()
      .nullable(),
    isOngoing: z.boolean(),
  })
  .refine(
    (data) => {
      // If not ongoing, end date is required
      if (!data.isOngoing && !data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date is required unless education is ongoing",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      // If both dates exist, end date should be after start date
      if (data.startDate && data.endDate && !data.isOngoing) {
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

type EducationFormValues = z.infer<typeof educationFormSchema>;

interface Education {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
}

export function UserEducation() {
  const [education, setEducation] = useState<Education[]>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<EducationFormValues>({
    resolver: zodResolver(educationFormSchema),
    defaultValues: {
      degree: "",
      institution: "",
      startDate: "",
      endDate: "",
      description: "",
      isOngoing: false,
    },
  });

  const isOngoing = form.watch("isOngoing");

  useEffect(() => {
    async function loadEducation() {
      try {
        const data = await getEducation();
        setEducation(
          data.map((exp) => ({
            ...exp,
            startDate: exp.startDate.toISOString().split("T")[0],
            endDate: exp.endDate
              ? exp.endDate.toISOString().split("T")[0]
              : null,
          }))
        );
      } catch (error) {
        console.error("Failed to load education:", error);
        toast.error("Failed to load education. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadEducation();
  }, []);

  // Reset end date when ongoing is checked
  useEffect(() => {
    if (isOngoing) {
      form.setValue("endDate", "");
    }
  }, [isOngoing, form]);

  const handleAddEducation = () => {
    form.reset({
      degree: "",
      institution: "",
      startDate: "",
      endDate: "",
      description: "",
      isOngoing: false,
    });
    setIsAddingNew(true);
    setEditingId(null);
  };

  const handleEditEducation = (edu: Education) => {
    form.reset({
      degree: edu.degree,
      institution: edu.institution,
      startDate: edu.startDate,
      endDate: edu.endDate || "",
      description: edu.description || "",
      isOngoing: !edu.endDate,
    });
    setEditingId(edu.id);
    setIsAddingNew(false);
  };

  const handleDeleteEducation = async (id: string) => {
    try {
      const user = await deleteEducation(id);
      console.log("Education deleted, ", user);
      setEducation(education?.filter((edu) => edu.id !== id));
      toast.success("Education deleted successfully!");
    } catch (e) {
      console.error("Failed to delete user education, ", e);
      toast.error("Failed to delete education. Please try again.");
    }
  };

  const onSubmit = async (data: EducationFormValues) => {
    const educationData = {
      degree: data.degree,
      institution: data.institution,
      startDate: data.startDate,
      endDate: data.isOngoing ? null : data.endDate || null,
      description: data.description || null,
    };

    try {
      if (editingId) {
        // Update existing education
        const educationToEdit = {
          ...educationData,
          id: editingId,
          startDate: new Date(educationData.startDate),
          endDate: educationData.endDate
            ? new Date(educationData.endDate)
            : null,
        };

        const user = await editEducation(educationToEdit);
        console.log("Education edited, ", user);

        setEducation(
          education?.map((edu) =>
            edu.id === editingId
              ? {
                  ...educationData,
                  id: editingId,
                  endDate: educationData.endDate || null,
                }
              : edu
          )
        );
        toast.success("Education updated successfully!");
      } else {
        // Add new education
        const educationToAdd = {
          ...educationData,
          startDate: new Date(educationData.startDate),
          endDate: educationData.endDate
            ? new Date(educationData.endDate)
            : null,
        };

        const user = await createEducation(educationToAdd);
        console.log("Education added, ", user);

        const newEducation: Education = {
          ...educationData,
          id: Date.now().toString(),
          endDate: educationData.endDate || null,
        };
        setEducation([newEducation, ...(education || [])]);
        toast.success("Education added successfully!");
      }

      // Reset form and states
      handleCancel();
    } catch (e) {
      console.error("Failed to save education: ", e);
      toast.error(
        editingId
          ? "Failed to update education. Please try again."
          : "Failed to add education. Please try again."
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
      : "Ongoing";
    return `${start} - ${end}`;
  };

  const renderEducationForm = () => (
    <div className="p-6 bg-[#1DBF9F]/5 border-l-4 border-[#1DBF9F]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base sm:text-lg">
              {editingId ? "Edit Education" : "Add New Education"}
            </h3>
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                className="bg-[#1DBF9F] hover:bg-[#1DBF9F]/80 text-white text-xs sm:text-sm"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white text-xs sm:text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Degree/Certification */}
            <FormField
              control={form.control}
              name="degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Degree/Certification
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Bachelor of Science in Computer Science"
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Institution */}
            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Institution
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Stanford University"
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
                          disabled={isOngoing}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value && !isOngoing
                            ? format(new Date(field.value), "MM/dd/yyyy")
                            : isOngoing
                            ? "Ongoing"
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
                        disabled={isOngoing}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Ongoing Checkbox */}
          <FormField
            control={form.control}
            name="isOngoing"
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
                    This is ongoing (currently enrolled/pursuing)
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
                    placeholder="Describe your studies, achievements, relevant coursework, GPA, honors, etc..."
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
          <h1 className="font-bold text-gray-900 flex items-center gap-2 text-xl sm:text-2xl">
            Education
          </h1>
        </div>
        <Button
          onClick={handleAddEducation}
          variant={"outline"}
          className="mr-10 text-sm"
        >
          Add Education
        </Button>
      </div>
      <Separator className="my-5" />
      <div>
        {isAddingNew && renderEducationForm()}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <LoaderCircle className="h-6 w-6 mx-auto mb-4 text-gray-300 animate-spin" />
            <p className="text-sm sm:text-base">Loading</p>
          </div>
        ) : education?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm sm:text-base">No education added yet</p>
            <p className="text-xs sm:text-sm">
              Click &apos;Add Education&apos; to get started
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {education?.map((edu) => (
              <div key={edu.id}>
                {editingId === edu.id ? (
                  renderEducationForm()
                ) : (
                  <div className="py-6 px-2 hover:bg-gray-50 transition-colors duration-200 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2 sm:space-y-3">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-gray-900 text-balance text-sm sm:text-base">
                            {edu.degree}
                          </h3>
                          <div className="flex items-center justify-between">
                            <p className="text-xs sm:text-sm font-medium text-gray-700">
                              {edu.institution}
                            </p>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                              {!edu.endDate && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-blue-100 text-blue-700 border-blue-200"
                                >
                                  Ongoing
                                </Badge>
                              )}
                              <span>
                                {formatDateRange(edu.startDate, edu.endDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed text-pretty">
                          {edu.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEducation(edu)}
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          disabled={isAddingNew || editingId !== null}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEducation(edu.id)}
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
