import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Building2,
  Calendar,
  GraduationCap,
  FolderOpen,
  Clock,
  DollarSign,
} from "lucide-react";

interface User {
  bio: string;
  experiences: Array<{
    id: string;
    title: string;
    company: string;
    startDate: Date;
    endDate: Date | null;
    description?: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate: Date | null;
    description?: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    scope: string;
    status: string;
    startDate: Date;
    estimatedEndDate: Date;
    budget: number;
    requiredSkills: string[];
  }>;
  totalHoursContributed: number;
  projectsCompleted: number;
}

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

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget);
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
          {user.experiences.map((experience, index) => (
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
          ))}
        </CardContent>
      </Card>

      {/* Education Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Education</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {user.education.map((edu, index) => (
            <div key={edu.id} className="flex gap-4">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-6 w-6 text-muted-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-balance">
                  {edu.institution}
                </h3>
                <p className="text-muted-foreground">
                  {edu.degree} in {edu.field}
                </p>
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
          ))}
        </CardContent>
      </Card>

      {/* Projects Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {user.projects.map((project, index) => (
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
                        {formatStatus(project.category)}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-sm text-muted-foreground">
                        {formatStatus(project.scope)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>{formatBudget(project.budget)}</span>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : project.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800"
                          : project.status === "OPEN"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {formatStatus(project.status)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDate(project.startDate)} -{" "}
                    {formatDate(project.estimatedEndDate)}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {project.description}
                </p>

                {project.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.requiredSkills.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-2 py-1 bg-muted rounded-md text-xs font-medium text-muted-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {index < user.projects.length - 1 && (
                  <hr className="mt-6 border-border" />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
