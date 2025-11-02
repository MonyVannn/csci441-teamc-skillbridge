"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { openChatWithUser } from "@/lib/chat-events";
import { Send } from "lucide-react";

type StartChatButtonProps = {
  userId: string;
  userName?: string;
  userAvatar?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export default function StartChatButton({
  userId,
  userName = "User",
  userAvatar = "",
  variant = "default",
  size = "default",
}: StartChatButtonProps) {
  const handleStartChat = () => {
    // Open the chat window immediately
    openChatWithUser(userId, userName, userAvatar);
  };

  return (
    <Button
      onClick={handleStartChat}
      variant={variant}
      size={size}
      className="rounded-full bg-[#695dcc] hover:bg-[#695dcc]/80 text-white font-medium"
    >
      <Send />
      Message
    </Button>
  );
}
