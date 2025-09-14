"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Globe, Users } from "lucide-react";
import { Separator } from "../ui/separator";
import { usePathname } from "next/navigation";

export function ProfileSidebar() {
  const pathname = usePathname();

  const peopleYouMayKnow = [
    {
      name: "Laylong U",
      title: "Student at American University of Phnom Penh",
      mutualConnections: 12,
    },
    {
      name: "Kimsun Seng",
      title: "Student at American University of Phnom Penh",
      mutualConnections: 8,
    },
    {
      name: "Kimtong Peng",
      title: "GIS & GeoIT Receptionist at Sungkyunkwan University",
      mutualConnections: 5,
    },
  ];

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
            <p>www.skillbridge.com{pathname}</p>
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
                  <AvatarFallback className="bg-muted">
                    {person.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{person.name}</p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {person.title}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs bg-transparent"
              >
                <Users className="h-3 w-3 mr-1" />
                Connect
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
