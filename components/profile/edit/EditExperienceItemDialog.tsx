"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Pencil, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { editExperience } from "@/lib/actions/user";
import { Experience } from "@prisma/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const experienceSchema = z
  .object({
    title: z
      .string()
      .min(1, "Job title is required")
      .max(100, "Job title must be less than 100 characters"),
    company: z
      .string()
      .min(1, "Company name is required")
      .max(100, "Company name must be less than 100 characters"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .optional(),
    isCurrentRole: z.boolean(),
  })
  .refine(
    (data) => {
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
      if (data.startDate && data.endDate && !data.isCurrentRole) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

interface EditExperienceItemDialogProps {
  experience: Experience;
}

type ExperienceFormValues = z.infer<typeof experienceSchema>;

export function EditExperienceItemDialog({
  experience,
}: EditExperienceItemDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: experience.title,
      company: experience.company,
      startDate: experience.startDate.toISOString().split("T")[0],
      endDate: experience.endDate
        ? experience.endDate.toISOString().split("T")[0]
        : "",
      description: experience.description || "",
      isCurrentRole: !experience.endDate,
    },
  });

  const isCurrentRole = form.watch("isCurrentRole");

  const onSubmit = async (values: z.infer<typeof experienceSchema>) => {
    try {
      const experienceData = {
        id: experience.id,
        title: values.title,
        company: values.company,
        startDate: new Date(values.startDate),
        endDate: values.isCurrentRole ? null : new Date(values.endDate!),
        description: values.description || "",
      };

      await editExperience(experienceData);
      toast.success("Experience updated successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Failed to update experience:", error);
      toast.error("Failed to update experience. Please try again.");
    }
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Experience</DialogTitle>
            <DialogDescription>
              Update your work experience details
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Software Engineer"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Tech Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(
                                    new Date(field.value + "T00:00:00"),
                                    "MM/dd/yyyy"
                                  )
                                : "Select start date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value
                                ? new Date(field.value + "T00:00:00")
                                : undefined
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
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                              disabled={isCurrentRole}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value && !isCurrentRole
                                ? format(
                                    new Date(field.value + "T00:00:00"),
                                    "MM/dd/yyyy"
                                  )
                                : isCurrentRole
                                ? "Current role"
                                : "Select end date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value
                                ? new Date(field.value + "T00:00:00")
                                : undefined
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
              <FormField
                control={form.control}
                name="isCurrentRole"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked) {
                            form.setValue("endDate", "");
                          }
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        I currently work here
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your responsibilities and achievements..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={form.formState.isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Experience
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
