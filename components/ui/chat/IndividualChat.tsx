"use client";

import React, { useState } from "react";
import { X, Send, Minus, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Separator } from "../separator";

export type IndividualChatProps = {
  id: string;
  name: string;
  avatar: string;
  isMinimized: boolean;
  onToggleMinimize: (chatId: string) => void;
  onClose: (chatId: string) => void;
};

export default function IndividualChat({
  id,
  name,
  avatar,
  isMinimized,
  onToggleMinimize,
  onClose,
}: IndividualChatProps) {
  const [messageInput, setMessageInput] = useState("");

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    // TODO: Send message to backend
    console.log(`Sending message to ${id}:`, messageInput);

    // Clear input
    setMessageInput("");
  };

  return (
    <div
      className={`shadow-lg border flex flex-col overflow-hidden rounded-t-xl rounded-b-none ${
        isMinimized ? "w-[230px]" : "w-[360px]"
      }`}
    >
      {/* Chat header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-white">
        <div
          className={`flex items-center gap-2 flex-1 min-w-0 ${
            isMinimized ? "overflow-hidden" : ""
          }`}
        >
          <Avatar className="h-7 w-7 flex-shrink-0">
            <AvatarImage src="" alt="Messaging" />
            <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-sm font-medium">
              {avatar}
            </AvatarFallback>
          </Avatar>
          <div className="w-full flex flex-col items-start min-w-0 font-semibold">
            <div className="text-sm font-semibold line-clamp-1">{name}</div>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => onToggleMinimize(id)}
            aria-label={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => onClose(id)}
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat body - only visible when not minimized */}
      {!isMinimized && (
        <>
          {/* Messages area */}
          <div className="flex-1 h-[400px] overflow-y-auto px-4 py-3 bg-white">
            {/* Example messages - replace with real data */}
            <div className="flex flex-col gap-4">
              {/* Received message */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarImage src="" alt="Messaging" />
                    <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-sm font-medium">
                      M
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold text-foreground">
                    {name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    12:18 PM
                  </span>
                </div>
                <div className="text-sm text-foreground leading-relaxed ml-9">
                  <p className="mb-3">Quick Connection Request</p>
                  <p className="mb-3">Hi Drew,</p>
                  <p className="mb-3">
                    I hope you&apos;re doing well! I&apos;m reaching out because
                    I&apos;m interested in the Software Engineer role at your
                    company. I would really appreciate any guidance on
                    connecting with the right person.
                  </p>
                  <p>Thank you!</p>
                  <p>Monyvann.</p>
                </div>
              </div>

              <Separator />

              {/* Sent message - example */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarImage src="" alt="Messaging" />
                    <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-sm font-medium">
                      M
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold text-foreground">
                    You
                  </span>
                  <span className="text-xs text-muted-foreground">2:54 PM</span>
                </div>
                <div className="text-sm text-foreground leading-relaxed ml-9">
                  <p>Attached is my most up-to-date resume.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Input area */}
          <div className="px-2 py-2 border-t bg-card">
            <div className="flex gap-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Write a message..."
                className="h-9 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="h-9 w-9 flex-shrink-0"
                disabled={!messageInput.trim()}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
