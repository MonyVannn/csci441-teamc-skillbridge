"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project, User } from "@prisma/client";

import {
  Building2,
  Calendar,
  GraduationCap,
  FolderOpen,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { EditAboutDialog } from "./edit/EditAboutDialog";
import { AddExperienceDialog } from "./edit/AddExperienceDialog";
import { AddEducationDialog } from "./edit/AddEducationDialog";
import { EditLinksDialog } from "./edit/EditLinksDialog";

// Check if a string has non-empty text and array with at least 1 element
const hasText = (v?: string | null): v is string =>
  typeof v === "string" && v.trim().length > 0;

interface ProfileContentProps {
  user: User;
  projects: Project[];
  isOwnProfile: boolean;
}

export function ProfileContent({
  user,
  projects,
  isOwnProfile,
}: ProfileContentProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const calculateDuration = (start: Date, end: Date | null) => {
    const endDate = end || new Date();
    const months = Math.round(
      (endDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    if (months < 12) return `${months} mos`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0
      ? `${years} yr ${remainingMonths} mos`
      : `${years} yr`;
  };

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-6 pb-10">
      {/* About Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">About</CardTitle>
          {isOwnProfile && (
            <EditAboutDialog currentBio={user.bio} currentIntro={user.intro} />
          )}
        </CardHeader>
        <CardContent>
          {/* Show bio if available, otherwise fallback message */}
          {hasText(user.bio) ? (
            <p className="text-sm leading-relaxed text-pretty">{user.bio}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isOwnProfile
                ? "Click 'Edit' to add information about yourself"
                : "No information provided by the user."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Experience Section */}
      {user.role === "USER" && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Experience</CardTitle>
              {isOwnProfile && (
                <div className="flex items-center">
                  <AddExperienceDialog />
                  {user.experiences.length > 0 && (
                    <Link href={`/profile/${user.clerkId}/experience`}>
                      <Button size="sm" variant="ghost">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {user.experiences.length > 0 ? (
                user.experiences.map((experience, index) => (
                  <div key={experience.id} className="flex gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-balance">
                        {experience.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {experience.company}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDate(experience.startDate)} -{" "}
                          {experience.endDate
                            ? formatDate(experience.endDate)
                            : "Present"}
                        </span>
                        <span>·</span>
                        <span>
                          {calculateDuration(
                            experience.startDate,
                            experience.endDate
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {experience.description}
                      </p>
                      {index < user.experiences.length - 1 && (
                        <hr className="mt-6 border-border" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isOwnProfile
                      ? "Click 'Add' to add your work experience"
                      : "No experiences provided by the user."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Education</CardTitle>
              {isOwnProfile && (
                <div className="flex items-center">
                  <AddEducationDialog />
                  {user.education.length > 0 && (
                    <Link href={`/profile/${user.clerkId}/education`}>
                      <Button size="sm" variant="ghost">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {user.education.length > 0 ? (
                user.education.map((edu, index) => (
                  <div key={edu.id} className="flex gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="h-6 w-6 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-balance">
                        {edu.institution}
                      </h3>
                      <p className="text-muted-foreground">{edu.degree}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDate(edu.startDate)} -{" "}
                          {edu.endDate ? formatDate(edu.endDate) : "Present"}
                        </span>
                        <span>·</span>
                        <span>
                          {calculateDuration(edu.startDate, edu.endDate)}
                        </span>
                      </div>
                      {edu.description && (
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                          {edu.description}
                        </p>
                      )}
                      {index < user.education.length - 1 && (
                        <hr className="mt-6 border-border" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isOwnProfile
                      ? "Click 'Add' to add your education"
                      : "No education provided by the user."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {projects.length > 0 ? (
                projects.map((project, index) => (
                  <div key={project.id} className="flex gap-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <FolderOpen className="h-6 w-6 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-balance">
                              {project.title}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                              <span>
                                {formatDate(project.startDate)} -{" "}
                                {project.estimatedEndDate
                                  ? formatDate(project.estimatedEndDate)
                                  : "Present"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={"outline"}>
                              {formatStatus(project.category)}
                            </Badge>
                            <Badge variant={"outline"}>
                              {formatStatus(project.scope)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {project.description}
                      </p>

                      {project.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {project.requiredSkills.map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant={"outline"}>
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {index < user.previousProjects.length - 1 && (
                        <hr className="mt-6 border-border" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">
                    No projects yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Links</CardTitle>
          {isOwnProfile && <EditLinksDialog currentLinks={user.socialLinks} />}
        </CardHeader>
        <CardContent className="space-y-6">
          {user.socialLinks.length > 0 ? (
            user.socialLinks.map((link, index) => (
              <div key={`${link.type}-${index}`}>
                <p className="text-sm font-semibold">{link.type}</p>
                <Link
                  href={link.url}
                  target={"_blank"}
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  {link.url}
                </Link>
              </div>
            ))
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">
                {isOwnProfile
                  ? "Click 'Edit Links' to add your social media and website links"
                  : "No links provided."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
