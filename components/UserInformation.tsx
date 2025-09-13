"use client";

import type React from "react";

import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { X, Plus, Trash2, Briefcase } from "lucide-react";

interface SocialLink {
  type: string;
  url: string;
}

interface UserData {
  imageUrl: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  intro: string;
  address: string;
  role: "USER" | "ADMIN" | "MODERATOR";
  occupied: boolean;
  socialLinks: SocialLink[]; // Keep this as is
  skills: string[];
}

interface UserProfileProps {
  initialData?: Partial<UserData>;
}

const defaultUserData: UserData = {
  imageUrl: "",
  firstName: "",
  lastName: "",
  email: "",
  bio: "",
  intro: "",
  address: "",
  role: "USER",
  occupied: false,
  socialLinks: [],
  skills: [],
};

const socialLinkTypes = [
  "LinkedIn",
  "Twitter",
  "GitHub",
  "Website",
  "Instagram",
  "Facebook",
];

export function UserInformation({ initialData }: UserProfileProps) {
  const [userData, setUserData] = useState<UserData>({
    ...defaultUserData,
    ...initialData,
  });
  const [editingData, setEditingData] = useState<UserData>(userData);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleEdit = () => {
    setEditingData(userData);
    setIsEditing(true);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setEditingData(userData);
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleSave = async () => {
    // Placeholder API call
    try {
      await updateUserProfile(editingData);
      setUserData(editingData);
      setIsEditing(false);
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleInputChange = (
    field: keyof UserData,
    value: string | boolean | SocialLink[] | string[]
  ) => {
    setEditingData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const addSocialLink = () => {
    handleInputChange("socialLinks", [
      ...editingData.socialLinks,
      { type: "LinkedIn", url: "" },
    ]);
  };

  const updateSocialLink = (
    index: number,
    field: "type" | "url",
    value: string
  ) => {
    const updated = editingData.socialLinks.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    );
    handleInputChange("socialLinks", updated);
  };

  const removeSocialLink = (index: number) => {
    const updated = editingData.socialLinks.filter((_, i) => i !== index);
    handleInputChange("socialLinks", updated);
  };

  const addSkill = () => {
    const newSkill = "New Skill";
    handleInputChange("skills", [...editingData.skills, newSkill]);
  };

  const updateSkill = (index: number, value: string) => {
    const updated = editingData.skills.map((skill, i) =>
      i === index ? value : skill
    );
    handleInputChange("skills", updated);
  };

  const removeSkill = (index: number) => {
    const updated = editingData.skills.filter((_, i) => i !== index);
    handleInputChange("skills", updated);
  };

  const displayData = isEditing ? editingData : userData;

  return (
    <div>
      {/* Header Card */}
      <div className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            <div className="flex-1 space-y-2">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <h1 className="font-bold text-balance text-muted-foreground">
                      {displayData.firstName} {displayData.lastName}
                    </h1>
                  </div>
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
                <Badge variant={displayData.occupied ? "default" : "outline"}>
                  {displayData.occupied ? "Available" : "Busy"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mr-5">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!hasChanges}>
                  Save
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleEdit}>
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Bio Section */}
        <div>
          <Label className="text-sm font-semibold">Bio</Label>
          {isEditing ? (
            <Textarea
              value={editingData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Write a short bio..."
              className="mt-2"
              rows={3}
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
          <Label className="text-sm font-semibold">Professional Intro</Label>
          {isEditing ? (
            <Textarea
              value={editingData.intro}
              onChange={(e) => handleInputChange("intro", e.target.value)}
              placeholder="Write your professional introduction..."
              className="mt-2"
              rows={4}
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
              <Input
                value={editingData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter your location"
                className="mt-2"
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
              <Select
                value={editingData.role}
                onValueChange={(value: "USER" | "ADMIN" | "MODERATOR") =>
                  handleInputChange("role", value)
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MODERATOR">Moderator</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm mt-2 text-muted-foreground">
                {displayData.role}
              </p>
            )}
          </div>
          <div>
            <Label className="text-sm font-semibold">Status</Label>
            {isEditing ? (
              <Select
                value={editingData.occupied ? "Available" : "Busy"}
                onValueChange={(value) =>
                  handleInputChange("occupied", value === "Available")
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Busy">Busy</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm mt-2 text-muted-foreground">
                {displayData.occupied ? "Available" : "Busy"}
              </p>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-5" />

      {/* Social Links Card */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Social Links</h3>
          {isEditing && (
            <Button size="sm" variant="outline" onClick={addSocialLink}>
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

      <Separator className="my-5" />

      {/* Skills Card */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Skills</h3>
          {isEditing && (
            <Button size="sm" variant="outline" onClick={addSkill}>
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
                      onChange={(e) => updateSkill(index, e.target.value)}
                      className="w-32 h-8 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSkill(index)}
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-300"
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
    </div>
  );
}

// Placeholder API function
async function updateUserProfile(data: UserData): Promise<void> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Profile updated:", data);
      resolve();
    }, 1000);
  });
}
