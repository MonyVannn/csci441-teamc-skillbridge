"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { openChatWithUser } from "@/lib/chat-events";
import { Send } from "lucide-react";

type StartChatButtonProps = {
  userId: string;
  clerkId: string;
  userName?: string;
  userAvatar?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export default function StartChatButton({
  userId,
  clerkId,
  userName = "User",
  userAvatar = "",
  className = "",
  variant = "default",
  size = "default",
}: StartChatButtonProps) {
  const handleStartChat = () => {
    // Open the chat window immediately
    openChatWithUser(userId, clerkId, userName, userAvatar);
  };

  return (
    <Button
      onClick={handleStartChat}
      variant={variant}
      size={size}
      className={className}
    >
      <Send />
      Message
    </Button>
  );
}
