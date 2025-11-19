"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from "@/components/ui/input";
import { Pencil, Loader2 } from "lucide-react";
import { updateUserHeader } from "@/lib/actions/user";
import { toast } from "sonner";

const headerSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  intro: z
    .string()
    .max(150, "Intro must be less than 150 characters")
    .optional(),
  address: z
    .string()
    .max(100, "Address must be less than 100 characters")
    .optional(),
});

interface EditHeaderDialogProps {
  currentFirstName: string | null;
  currentLastName: string | null;
  currentIntro: string | null;
  currentAddress: string | null;
}

export function EditHeaderDialog({
  currentFirstName,
  currentLastName,
  currentIntro,
  currentAddress,
}: EditHeaderDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof headerSchema>>({
    resolver: zodResolver(headerSchema),
    defaultValues: {
      firstName: currentFirstName || "",
      lastName: currentLastName || "",
      intro: currentIntro || "",
      address: currentAddress || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof headerSchema>) => {
    try {
      await updateUserHeader(
        values.firstName,
        values.lastName,
        values.intro || "",
        values.address || ""
      );
      toast.success("Profile updated successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your name, professional intro, and location
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="intro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Intro</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Full-stack Developer | React Enthusiast"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A short headline that appears below your name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., San Francisco, CA"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your city and state/country
                  </FormDescription>
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
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
