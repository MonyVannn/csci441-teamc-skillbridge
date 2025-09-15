import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "@prisma/client";
import { MapPin, Award, Clock, Briefcase } from "lucide-react";
import Image from "next/image";

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="mx-4 mt-4 mb-6 overflow-hidden">
      {/* Header Background */}
      <Image
        src="/bg.jpeg"
        alt="bg"
        width={1920}
        height={1080}
        className="h-[400px]"
      />

      <div className="relative px-6 pb-6">
        {/* Profile Picture */}
        <div className="absolute -top-20 left-6">
          <Avatar className="w-40 h-40 border-4 border-background">
            <AvatarImage src={user?.imageUrl || ""} />
            <AvatarFallback className="text-2xl bg-muted">
              {user.firstName}
              {user.lastName}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Profile Info */}
        <div className="pt-24 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-balance capitalize">
                {user.firstName} {user.lastName}
              </h1>
            </div>

            <p className="text-xl text-muted-foreground mb-3 text-pretty">
              {user.intro}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {user.address}
              </div>
            </div>

            {/* Badges and Stats Section */}
            <div className="space-y-3 mb-4">
              {/* Skill Badges */}
              {user.earnedSkillBadges.length > 0 && (
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium">Skill Badges:</span>
                  {user.earnedSkillBadges.map((badge) => (
                    <Badge
                      key={badge}
                      variant="outline"
                      className="text-xs bg-amber-50 text-amber-700 border-amber-200"
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Specialization Badges */}
              {user.earnedSpecializationBadges.length > 0 && (
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Specializations:</span>
                  {user.earnedSpecializationBadges.map((badge) => (
                    <Badge
                      key={badge}
                      variant="outline"
                      className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                    >
                      {badge.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">
                    {user.totalHoursContributed.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    hours contributed
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{user.projectsCompleted}</span>
                  <span className="text-muted-foreground">
                    projects completed
                  </span>
                </div>
              </div>

              {/* Industries */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Industries:</span>
                <div className="flex gap-1">
                  {user.industriesExperienced.map((industry) => (
                    <Badge
                      key={industry}
                      variant="secondary"
                      className="text-xs"
                    >
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
