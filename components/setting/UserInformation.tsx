"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { X, Plus, Trash2, Briefcase, LoaderCircle } from "lucide-react";
import { editUserInformation, getUser } from "@/lib/actions/user";
import { User } from "@prisma/client";
import { toast } from "sonner";

const socialLinkTypes = [
  "LinkedIn",
  "Twitter",
  "GitHub",
  "Website",
  "Instagram",
  "Facebook",
];

// Zod schema for validation
const userInformationSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z.string().max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  bio: z
    .string()
    .max(1000, "Bio must be less than 500 characters")
    .optional()
    .nullable(),
  intro: z
    .string()
    .max(500, "Professional intro must be less than 1000 characters")
    .optional()
    .nullable(),
  address: z
    .string()
    .max(200, "Location must be less than 200 characters")
    .optional()
    .nullable(),
  role: z.enum(["USER", "BUSINESS_OWNER", "ADMIN"]),
  occupied: z.boolean(),
  socialLinks: z.array(
    z.object({
      type: z.string().min(1, "Social link type is required"),
      url: z.string().url("Invalid URL format"),
    })
  ),
  skills: z.array(
    z
      .string()
      .min(1, "Skill cannot be empty")
      .max(20, "Each skill must be 20 characters or less")
  ),
});

type UserInformationFormData = z.infer<typeof userInformationSchema>;

export function UserInformation() {
  const [userData, setUserData] = useState<User>();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<UserInformationFormData>({
    resolver: zodResolver(userInformationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      bio: "",
      intro: "",
      address: "",
      role: "USER",
      occupied: true,
      socialLinks: [],
      skills: [],
    },
  });

  useEffect(() => {
    async function loadUser() {
      try {
        setIsLoading(true);
        const data = await getUser();
        setUserData(data);

        // Set form values with loaded data
        form.reset({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          bio: data.bio || "",
          intro: data.intro || "",
          address: data.address || "",
          role: data.role as "USER" | "BUSINESS_OWNER" | "ADMIN",
          occupied: data.occupied ?? true,
          socialLinks: data.socialLinks || [],
          skills: data.skills || [],
        });
      } catch (error) {
        console.error("Failed to load user data:", error);
        toast.error("Failed to load user information");
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (!userData) return;

    // Reset form to original values
    form.reset({
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      bio: userData.bio || "",
      intro: userData.intro || "",
      address: userData.address || "",
      role: userData.role as "USER" | "BUSINESS_OWNER" | "ADMIN",
      occupied: userData.occupied ?? true,
      socialLinks: userData.socialLinks || [],
      skills: userData.skills || [],
    });

    setIsEditing(false);
  };

  const handleSubmit = async (data: UserInformationFormData) => {
    try {
      await editUserInformation(data as unknown as User);
      setUserData(data as unknown as User);
      setIsEditing(false);
      toast.success("User information updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update user information. Please try again.");
    }
  };

  const addSocialLink = () => {
    const currentLinks = form.getValues("socialLinks");
    form.setValue(
      "socialLinks",
      [...currentLinks, { type: "LinkedIn", url: "" }],
      { shouldDirty: true }
    );
  };

  const updateSocialLink = (
    index: number,
    field: "type" | "url",
    value: string
  ) => {
    const currentLinks = form.getValues("socialLinks");
    const updated = currentLinks.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    );
    form.setValue("socialLinks", updated, { shouldDirty: true });
  };

  const removeSocialLink = (index: number) => {
    const currentLinks = form.getValues("socialLinks");
    const updated = currentLinks.filter((_, i) => i !== index);
    form.setValue("socialLinks", updated, { shouldDirty: true });
  };

  const addSkill = () => {
    const currentSkills = form.getValues("skills");
    form.setValue("skills", [...currentSkills, "New Skill"], {
      shouldDirty: true,
    });
  };

  const updateSkill = (index: number, value: string) => {
    const currentSkills = form.getValues("skills");
    const updated = currentSkills.map((skill, i) =>
      i === index ? value : skill
    );
    form.setValue("skills", updated, { shouldDirty: true });
  };

  const removeSkill = (index: number) => {
    const currentSkills = form.getValues("skills");
    const updated = currentSkills.filter((_, i) => i !== index);
    form.setValue("skills", updated, { shouldDirty: true });
  };

  const watchedValues = form.watch();
  const displayData = isEditing ? watchedValues : userData;

  return (
    <div>
      {/* Header Card */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-bold text-gray-900 flex items-center gap-2">
            {!userData ? (
              <span>Loading...</span>
            ) : userData.role === "BUSINESS_OWNER" ? (
              "Organization Information"
            ) : (
              "User Information"
            )}
          </h1>
        </div>
        <div className="flex gap-2 mr-5">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={form.handleSubmit(handleSubmit)}
                disabled={
                  !form.formState.isDirty || form.formState.isSubmitting
                }
              >
                {form.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleEdit}>
              Edit
            </Button>
          )}
        </div>
      </div>

      <Separator className="my-5" />

      {isLoading || !displayData ? (
        <div className="text-center py-12 text-gray-500">
          <LoaderCircle className="h-6 w-6 mx-auto mb-4 text-gray-300 animate-spin" />
          <p>Loading</p>
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-6">
                  <div className="flex-1 space-y-2">
                    {isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Enter first name"
                                />
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
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Enter last name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : (
                      <h1 className="font-bold text-balance">
                        {displayData.firstName} {displayData.lastName}
                      </h1>
                    )}

                    <div className="text-sm flex items-center gap-2 text-muted-foreground">
                      <span>{displayData.email}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge
                        variant={
                          displayData.role === "ADMIN" ? "default" : "secondary"
                        }
                      >
                        <Briefcase className="w-3 h-3 mr-1" />
                        {displayData.role}
                      </Badge>
                      {displayData.role !== "BUSINESS_OWNER" && (
                        <Badge
                          variant={displayData.occupied ? "default" : "outline"}
                        >
                          {displayData.occupied ? "Available" : "Busy"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <Label className="text-sm font-semibold">Bio</Label>
              {isEditing ? (
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Write a short bio..."
                          className="mt-2"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <p className="text-sm mt-2 text-muted-foreground">
                  {displayData.bio || "No bio provided"}
                </p>
              )}
            </div>

            <Separator />

            {/* Intro Section */}
            <div>
              <Label className="text-sm font-semibold">
                Professional Intro
              </Label>
              {isEditing ? (
                <FormField
                  control={form.control}
                  name="intro"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Write your professional introduction..."
                          className="mt-2"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <p className="text-sm mt-2 text-muted-foreground">
                  {displayData.intro || "No introduction provided"}
                </p>
              )}
            </div>

            <Separator />

            {/* Settings Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-sm font-semibold">Location</Label>
                {isEditing ? (
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ""}
                            placeholder="Enter your location"
                            className="mt-2"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="text-sm mt-2 flex items-center gap-2 text-muted-foreground">
                    <span>{displayData.address || "No location provided"}</span>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-semibold">Role</Label>
                {isEditing ? (
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USER">User</SelectItem>
                            <SelectItem value="BUSINESS_OWNER">
                              Organization
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <p className="text-sm mt-2 text-muted-foreground">
                    {displayData.role}
                  </p>
                )}
              </div>
              {displayData.role !== "BUSINESS_OWNER" && (
                <div>
                  <Label className="text-sm font-semibold">Status</Label>
                  {isEditing ? (
                    <FormField
                      control={form.control}
                      name="occupied"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            value={field.value ? "Available" : "Busy"}
                            onValueChange={(value) =>
                              field.onChange(value === "Available")
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="mt-2">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Available">
                                Available
                              </SelectItem>
                              <SelectItem value="Busy">Busy</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <p className="text-sm mt-2 text-muted-foreground">
                      {displayData.occupied ? "Available" : "Busy"}
                    </p>
                  )}
                </div>
              )}
            </div>

            <Separator className="my-5" />

            {/* Social Links Card */}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Social Links</h3>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addSocialLink}
                    type="button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Link
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-5">
              {displayData.socialLinks.length === 0 ? (
                <p className="text-muted-foreground">No social links added</p>
              ) : (
                <div className="space-y-3">
                  {displayData.socialLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {isEditing ? (
                        <>
                          <Select
                            value={link.type}
                            onValueChange={(value) =>
                              updateSocialLink(index, "type", value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {socialLinkTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            value={link.url}
                            onChange={(e) =>
                              updateSocialLink(index, "url", e.target.value)
                            }
                            placeholder="Enter URL"
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeSocialLink(index)}
                            type="button"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Badge variant="secondary">{link.type}</Badge>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className=" hover:underline flex-1 text-sm text-blue-500"
                          >
                            {link.url}
                          </a>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {displayData.role !== "BUSINESS_OWNER" && (
              <>
                <Separator className="my-5" />

                {/* Skills Card */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Skills</h3>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={addSkill}
                        type="button"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Skill
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-5">
                  {displayData.skills.length === 0 ? (
                    <p className="text-muted-foreground">No skills added</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {displayData.skills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-1">
                          {isEditing ? (
                            <div className="flex items-center bg-secondary rounded-md">
                              <Input
                                value={skill}
                                onChange={(e) =>
                                  updateSkill(index, e.target.value)
                                }
                                className="w-32 h-8 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                                maxLength={20}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeSkill(index)}
                                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-300"
                                type="button"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="secondary">{skill}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </form>
        </Form>
      )}
    </div>
  );
}
