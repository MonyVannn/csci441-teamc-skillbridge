"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, Link as LinkIcon } from "lucide-react";
import { updateSocialLinks } from "@/lib/actions/user";
import { toast } from "sonner";

interface SocialLink {
  type: string;
  url: string;
}

interface EditLinksDialogProps {
  currentLinks: SocialLink[];
}

const LINK_TYPES = [
  "LinkedIn",
  "GitHub",
  "Portfolio",
  "Twitter",
  "Facebook",
  "Instagram",
  "YouTube",
  "Medium",
  "Dev.to",
  "Stack Overflow",
  "Personal Website",
  "Other",
];

const linksSchema = z.object({
  links: z.array(
    z.object({
      type: z.string().min(1, "Type is required"),
      url: z.string().url("Please enter a valid URL"),
    })
  ),
  newLinkType: z.string(),
  newLinkUrl: z.string(),
});

type LinksFormValues = z.infer<typeof linksSchema>;

export function EditLinksDialog({ currentLinks }: EditLinksDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<LinksFormValues>({
    resolver: zodResolver(linksSchema),
    defaultValues: {
      links: currentLinks.length > 0 ? currentLinks : [],
      newLinkType: "LinkedIn",
      newLinkUrl: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "links",
  });

  // Reset form when dialog opens with current links
  useEffect(() => {
    if (open) {
      form.reset({
        links: currentLinks.length > 0 ? currentLinks : [],
        newLinkType: "LinkedIn",
        newLinkUrl: "",
      });
    }
  }, [open, currentLinks, form]);

  const handleAddLink = () => {
    const newLinkType = form.getValues("newLinkType");
    const newLinkUrl = form.getValues("newLinkUrl");

    if (!newLinkUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(newLinkUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    console.log("Adding link:", { type: newLinkType, url: newLinkUrl });
    append({ type: newLinkType, url: newLinkUrl });
    console.log("Current links after append:", form.getValues("links"));
    form.setValue("newLinkType", "LinkedIn");
    form.setValue("newLinkUrl", "");
  };

  const onSubmit = async (values: LinksFormValues) => {
    try {
      console.log("Form values on submit:", values);
      console.log("Links array:", values.links);
      console.log("Number of links:", values.links.length);
      await updateSocialLinks(values.links);
      toast.success("Links updated successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Failed to update links:", error);
      toast.error("Failed to update links. Please try again.");
    }
  };

  const handleCancel = () => {
    form.reset({
      links: currentLinks.length > 0 ? currentLinks : [],
      newLinkType: "LinkedIn",
      newLinkUrl: "",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Social Links</DialogTitle>
          <DialogDescription>
            Add, edit, or remove your social media and website links
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Existing Links */}
            {fields.length > 0 && (
              <div className="space-y-3">
                <FormLabel>Your Links</FormLabel>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50"
                  >
                    <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {form.watch(`links.${index}.type`)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {form.watch(`links.${index}.url`)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={form.formState.isSubmitting}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Link */}
            <div className="space-y-3 pt-4 border-t">
              <FormLabel>Add New Link</FormLabel>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="newLinkType"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LINK_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newLinkUrl"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddLink}
                  disabled={form.formState.isSubmitting}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the full URL including https://
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
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
