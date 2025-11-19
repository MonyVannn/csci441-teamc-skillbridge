import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "@/lib/actions/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap, Calendar } from "lucide-react";
import Link from "next/link";
import { EditEducationItemDialog } from "@/components/profile/edit/EditEducationItemDialog";
import { DeleteEducationButton } from "@/components/profile/edit/DeleteEducationButton";

interface EducationPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function EducationPage({ params }: EducationPageProps) {
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
          <h1 className="text-3xl font-bold">Manage Education</h1>
          <p className="text-muted-foreground mt-2">
            Add, edit, or remove your education
          </p>
        </div>

        {/* Education List */}
        <div className="space-y-4">
          {userData.education.length > 0 ? (
            userData.education.map((edu) => (
              <Card key={edu.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl">
                          {edu.institution}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1">
                          {edu.degree}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {formatDate(edu.startDate)} -{" "}
                            {edu.endDate ? formatDate(edu.endDate) : "Present"}
                          </span>
                          <span>·</span>
                          <span>
                            {calculateDuration(edu.startDate, edu.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <EditEducationItemDialog education={edu} />
                      <DeleteEducationButton
                        educationId={edu.id}
                        educationTitle={edu.degree}
                      />
                    </div>
                  </div>
                </CardHeader>
                {edu.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {edu.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No education added yet
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your education from your profile page
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
