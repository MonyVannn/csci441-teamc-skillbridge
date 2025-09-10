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
  GraduationCap,
  CalendarIcon,
  LoaderCircle,
} from "lucide-react";
import { Separator } from "./ui/separator";
import {
  createEducation,
  deleteEducation,
  editEducation,
  getEducation,
} from "@/lib/actions/user";

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
  const [formData, setFormData] = useState({
    degree: "",
    institution: "",
    startDate: "",
    endDate: "",
    description: "",
    isOngoing: false,
  });

  useEffect(() => {
    async function loadExperiences() {
      try {
        const data = await getEducation();
        setEducation(
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

  const handleAddEducation = () => {
    setFormData({
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
    setFormData({
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
    } catch (e) {
      console.error("Failed to delete user education, ", e);
    }
  };

  const handleSaveEducation = async () => {
    const educationData = {
      degree: formData.degree,
      institution: formData.institution,
      startDate: formData.startDate,
      endDate: formData.isOngoing ? null : formData.endDate,
      description: formData.description,
    };

    if (editingId) {
      // Update existing education
      try {
        const educationToEdit = {
          ...educationData,
          id: editingId,
          startDate: new Date(educationData.startDate),
          endDate: educationData.endDate
            ? new Date(educationData.endDate)
            : null,
        };

        const user = await editEducation(educationToEdit);

        console.log("Experience edited, ", user);

        setEducation(
          education?.map((edu) =>
            edu.id === editingId ? { ...educationData, id: editingId } : edu
          )
        );
      } catch (e) {
        console.error("Failed to edit user experience");
      }
    } else {
      try {
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
        };
        setEducation([newEducation, ...(education || [])]);
      } catch (e) {
        console.log("Error adding new education: ", e);
      }
    }

    // Reset states
    setEditingId(null);
    setIsAddingNew(false);
    setFormData({
      degree: "",
      institution: "",
      startDate: "",
      endDate: "",
      description: "",
      isOngoing: false,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAddingNew(false);
    setFormData({
      degree: "",
      institution: "",
      startDate: "",
      endDate: "",
      description: "",
      isOngoing: false,
    });
  };

  const handleOngoingChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isOngoing: checked,
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
      : "Ongoing";
    return `${start} - ${end}`;
  };

  const renderEducationForm = () => (
    <div className="p-6 bg-[#1DBF9F]/5 border-l-4 border-[#1DBF9F]">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            {editingId ? "Edit Education" : "Add New Education"}
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveEducation}
              size="sm"
              className="bg-[#1DBF9F] hover:bg-[#1DBF9F]/80 text-white"
              disabled={
                !formData.degree || !formData.institution || !formData.startDate
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
          {/* Degree/Certification */}
          <div className="space-y-2">
            <Label
              htmlFor="degree"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              Degree/Certification
            </Label>
            <Input
              id="degree"
              value={formData.degree}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, degree: e.target.value }))
              }
              placeholder="e.g. Bachelor of Science in Computer Science"
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Institution */}
          <div className="space-y-2">
            <Label
              htmlFor="institution"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              Institution
            </Label>
            <Input
              id="institution"
              value={formData.institution}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  institution: e.target.value,
                }))
              }
              placeholder="e.g. Stanford University"
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
                  disabled={formData.isOngoing}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.endDate && !formData.isOngoing
                    ? format(formData.endDate, "MM/dd/yyyy")
                    : formData.isOngoing
                    ? "Ongoing"
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

        {/* Ongoing Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="ongoing"
            checked={formData.isOngoing}
            onCheckedChange={handleOngoingChange}
            className="border-gray-300 bg-white"
          />
          <Label
            htmlFor="ongoing"
            className="text-sm text-gray-700 cursor-pointer"
          >
            This is ongoing (currently enrolled/pursuing)
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
            placeholder="Describe your studies, achievements, relevant coursework, GPA, honors, etc..."
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
            Education
          </h1>
        </div>
        <Button onClick={handleAddEducation} className="mr-10">
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </div>
      <Separator className="my-5" />
      <div>
        {isAddingNew && renderEducationForm()}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <LoaderCircle className="h-6 w-6 mx-auto mb-4 text-gray-300 animate-spin" />
            <p>Loading</p>
          </div>
        ) : education?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No education added yet</p>
            <p className="text-sm">
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
                      <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-gray-900 text-balance">
                            {edu.degree}
                          </h3>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-700">
                              {edu.institution}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
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
                        <p className="text-sm text-gray-600 leading-relaxed text-pretty">
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
