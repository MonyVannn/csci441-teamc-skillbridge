"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Globe } from "lucide-react";
import { Separator } from "../ui/separator";
import { usePathname } from "next/navigation";
import { User } from "@prisma/client";
import StartChatButton from "../ui/chat/StartChatButton";

interface ProfileSidebarProps {
  peopleYouMayKnow: User[];
}

export function ProfileSidebar({ peopleYouMayKnow }: ProfileSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Profile language</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-muted-foreground"
            >
              English
            </Button>
          </div>
          <Separator className="my-5" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Public profile & URL</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-muted-foreground"
            >
              <Globe className="h-3 w-3" />
            </Button>
          </div>
          <div>
            <p className="text-sm text-muted-foreground break-all">
              www.skillbridge.com{pathname}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* People You May Know */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">People you may know</CardTitle>
          <p className="text-xs text-muted-foreground">From your profile</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {peopleYouMayKnow.map((person, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={person.imageUrl || ""} />
                  <AvatarFallback className="bg-muted">
                    {person.firstName}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {person.firstName + " " + person.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {person.intro}
                  </p>
                </div>
              </div>

              <StartChatButton
                userId={person.id}
                clerkId={person.clerkId}
                userName={`${person.firstName} ${person.lastName}`}
                userAvatar={person.imageUrl || ""}
                variant="outline"
                size="sm"
                className="w-full text-xs bg-transparent"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
