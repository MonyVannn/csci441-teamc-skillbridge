"use client";

import { useState } from "react";
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
import { Plus, Pencil, Trash2, Building2, CalendarIcon } from "lucide-react";
import { Separator } from "./ui/separator";

interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
}

const mockExperiences: Experience[] = [
  {
    id: "1",
    title: "Senior Software Engineer",
    company: "TechCorp Inc.",
    startDate: "2022-01",
    endDate: null,
    description:
      "Leading a team of 5 developers in building scalable web applications using React, Node.js, and AWS. Implemented CI/CD pipelines and improved deployment efficiency by 40%.",
  },
  {
    id: "2",
    title: "Full Stack Developer",
    company: "StartupXYZ",
    startDate: "2020-06",
    endDate: "2021-12",
    description:
      "Developed and maintained multiple client projects using modern web technologies. Collaborated with designers and product managers to deliver high-quality user experiences.",
  },
  {
    id: "3",
    title: "Frontend Developer",
    company: "Digital Agency",
    startDate: "2019-03",
    endDate: "2020-05",
    description:
      "Created responsive websites and web applications for various clients. Specialized in React, TypeScript, and modern CSS frameworks.",
  },
];

export function UserExperience() {
  const [experiences, setExperiences] = useState<Experience[]>(mockExperiences);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
    isCurrentRole: false,
  });

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
      description: experience.description,
      isCurrentRole: !experience.endDate,
    });
    setEditingId(experience.id);
    setIsAddingNew(false);
  };

  const handleDeleteExperience = (id: string) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  const handleSaveExperience = () => {
    const experienceData = {
      title: formData.title,
      company: formData.company,
      startDate: formData.startDate,
      endDate: formData.isCurrentRole ? null : formData.endDate,
      description: formData.description,
    };

    if (editingId) {
      // Update existing experience
      setExperiences(
        experiences.map((exp) =>
          exp.id === editingId ? { ...experienceData, id: editingId } : exp
        )
      );
    } else {
      // Add new experience
      const newExperience: Experience = {
        ...experienceData,
        id: Date.now().toString(),
      };
      setExperiences([newExperience, ...experiences]);
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
                    ? format(new Date(formData.startDate + "-01"), "MMMM yyyy")
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
                      const monthYear = format(date, "yyyy-MM");
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
                    ? format(new Date(formData.endDate + "-01"), "MMMM yyyy")
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
                      const monthYear = format(date, "yyyy-MM");
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

        {experiences.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No experiences added yet</p>
            <p className="text-sm">
              Click &apos;Add Experience&apos; to get started
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {experiences.map((experience) => (
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
                                  className="text-xs bg-green-100 text-green-700 border-green-200"
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
