import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "@/lib/actions/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Calendar } from "lucide-react";
import Link from "next/link";
import { EditExperienceItemDialog } from "@/components/profile/edit/EditExperienceItemDialog";
import { DeleteExperienceButton } from "@/components/profile/edit/DeleteExperienceButton";

interface ExperiencePageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function ExperiencePage({ params }: ExperiencePageProps) {
  const { userId } = await params;
  const currentUserData = await currentUser();

  // Only allow users to edit their own profile
  if (!currentUserData || currentUserData.id !== userId) {
    redirect(`/profile/${userId}`);
  }

  const userData = await getUserByClerkId(userId);

  if (!userData) {
    redirect(`/profile/${userId}`);
  }

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

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/profile/${userId}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Manage Experience</h1>
          <p className="text-muted-foreground mt-2">
            Add, edit, or remove your work experience
          </p>
        </div>

        {/* Experience List */}
        <div className="space-y-4">
          {userData.experiences.length > 0 ? (
            userData.experiences.map((experience) => (
              <Card key={experience.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl">
                          {experience.title}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1">
                          {experience.company}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                          <Calendar className="h-3.5 w-3.5" />
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
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <EditExperienceItemDialog experience={experience} />
                      <DeleteExperienceButton
                        experienceId={experience.id}
                        experienceTitle={experience.title}
                      />
                    </div>
                  </div>
                </CardHeader>
                {experience.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {experience.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No experience added yet
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your work experience from your profile page
                </p>
                <Link href={`/profile/${userId}`}>
                  <Button>Go to Profile</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
