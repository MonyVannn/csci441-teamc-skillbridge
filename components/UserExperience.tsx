"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  CalendarIcon,
  LoaderCircle,
} from "lucide-react";
import { Separator } from "./ui/separator";
import {
  createExperience,
  deleteExperience,
  editExperience,
  getExperience,
} from "@/lib/actions/user";

interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string | null; // Allow description to be null
}

export function UserExperience() {
  const [experiences, setExperiences] = useState<Experience[]>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
    isCurrentRole: false,
  });

  useEffect(() => {
    async function loadExperiences() {
      try {
        const data = await getExperience();
        setExperiences(
          data.map((exp) => ({
            ...exp,
            startDate: exp.startDate.toISOString().split("T")[0], // Convert Date to string
            endDate: exp.endDate
              ? exp.endDate.toISOString().split("T")[0]
              : null, // Convert Date to string or null
          }))
        );
      } catch (error) {
        console.error("Failed to load experiences:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadExperiences();
  }, []);

  const handleAddExperience = () => {
    setFormData({
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
    setFormData({
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
    } catch (e) {
      console.error("Failed to delete user experience, ", e);
    }
  };

  const handleSaveExperience = async () => {
    const experienceData = {
      title: formData.title,
      company: formData.company,
      startDate: formData.startDate,
      endDate: formData.isCurrentRole ? null : formData.endDate,
      description: formData.description,
    };

    if (editingId) {
      try {
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

        // Update existing experience
        setExperiences(
          experiences?.map((exp) =>
            exp.id === editingId ? { ...experienceData, id: editingId } : exp
          )
        );
      } catch (e) {
        console.error("Failed to edit user experience");
      }
    } else {
      // Add new experience
      try {
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
        };
        setExperiences([newExperience, ...(experiences || [])]);
      } catch (e) {
        console.log("Error adding new experience: ", e);
      }
    }

    // Reset states
    setEditingId(null);
    setIsAddingNew(false);
    setFormData({
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
      isCurrentRole: false,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAddingNew(false);
    setFormData({
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
      isCurrentRole: false,
    });
  };

  const handleCurrentRoleChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isCurrentRole: checked,
      endDate: checked ? "" : prev.endDate,
    }));
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            {editingId ? "Edit Experience" : "Add New Experience"}
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveExperience}
              size="sm"
              className="bg-[#1DBF9F] hover:bg-[#1DBF9F]/80 text-white"
              disabled={
                !formData.title || !formData.company || !formData.startDate
              }
            >
              Save
            </Button>
            <Button
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
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              Job Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. Senior Software Engineer"
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label
              htmlFor="company"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              Company
            </Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, company: e.target.value }))
              }
              placeholder="e.g. TechCorp Inc."
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="startDate"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              Start Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate
                    ? format(formData.startDate, "MM/dd/yyyy")
                    : "Select start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={
                    formData.startDate
                      ? new Date(formData.startDate + "-01")
                      : undefined
                  }
                  onSelect={(date) => {
                    if (date) {
                      const monthYear = format(date, "MM/dd/yyyy");
                      setFormData((prev) => ({
                        ...prev,
                        startDate: monthYear,
                      }));
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="endDate"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              End Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                  disabled={formData.isCurrentRole}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.endDate && !formData.isCurrentRole
                    ? format(formData.endDate, "MM/dd/yyyy")
                    : formData.isCurrentRole
                    ? "Present"
                    : "Select end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={
                    formData.endDate
                      ? new Date(formData.endDate + "-01")
                      : undefined
                  }
                  onSelect={(date) => {
                    if (date) {
                      const monthYear = format(date, "MM/dd/yyyy");
                      setFormData((prev) => ({ ...prev, endDate: monthYear }));
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Current Role Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="currentRole"
            checked={formData.isCurrentRole}
            onCheckedChange={handleCurrentRoleChange}
            className="border-gray-300 bg-white"
          />
          <Label
            htmlFor="currentRole"
            className="text-sm text-gray-700 cursor-pointer"
          >
            I currently work in this role
          </Label>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label
            htmlFor="description"
            className="text-sm font-medium text-gray-700 flex items-center gap-2"
          >
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Describe your role, responsibilities, and key achievements..."
            rows={4}
            className="border-gray-100 focus:border-blue-500 focus:ring-blue-500 resize-none bg-white"
          />
        </div>
      </div>
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
        <Button onClick={handleAddExperience} className="mr-10">
          <Plus className="h-4 w-4 mr-2" />
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
