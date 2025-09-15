import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@prisma/client";

import {
  Building2,
  Calendar,
  GraduationCap,
  FolderOpen,
  Clock,
} from "lucide-react";

interface ProfileContentProps {
  user: User;
}

export function ProfileContent({ user }: ProfileContentProps) {
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
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-pretty">{user.bio}</p>
        </CardContent>
      </Card>

      {/* Experience Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Experience</CardTitle>
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
                  <p className="text-muted-foreground">{experience.company}</p>
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
                No experiences provided by the user.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Education Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Education</CardTitle>
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
                    <span>{calculateDuration(edu.startDate, edu.endDate)}</span>
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
                No education provided by the user.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {user.previousProjects.length > 0 ? (
            user.previousProjects.map((project, index) => (
              <div key={project.id} className="flex gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="h-6 w-6 text-muted-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-balance">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {formatStatus(project.industry)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatDate(project.startDate)} -{" "}
                      {project.endDate
                        ? formatDate(project.endDate)
                        : "Present"}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {project.description}
                  </p>

                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.tags.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-2 py-1 bg-muted rounded-md text-xs font-medium text-muted-foreground"
                        >
                          {skill}
                        </span>
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
              <p className="text-sm text-muted-foreground">No projects yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
