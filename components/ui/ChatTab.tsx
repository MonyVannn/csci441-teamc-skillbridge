"use client";

import React, { useEffect, useRef, useState } from "react";
import { MoreHorizontal, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChatList, { type Conversation } from "@/components/ui/chat/ChatList";
import IndividualChat from "@/components/ui/chat/IndividualChat";

// Type for individual chat state
type ChatWindow = {
  id: string;
  name: string;
  avatar: string;
  isMinimized: boolean;
};

export default function ChatTab() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [buttonWidth, setButtonWidth] = useState(300);
  const [openChats, setOpenChats] = useState<ChatWindow[]>([]); // Track open individual chats

  // Mock conversation data - replace with real data
  const conversations: Conversation[] = [
    {
      id: "1",
      name: "Anna Button",
      avatar: "",
      lastMessage: "You: Thanks, Anna",
      time: "Oct 30",
      unread: false,
    },
    {
      id: "2",
      name: "Sunil Dixit",
      avatar: "",
      lastMessage: "Connecting About the Role",
      time: "Oct 27",
      unread: false,
    },
    {
      id: "3",
      name: "Daniel Glasgow",
      avatar: "",
      lastMessage: "Seeking Connection for Role",
      time: "Oct 23",
      unread: true,
    },
    {
      id: "4",
      name: "Peter DiDomenico",
      avatar: "",
      lastMessage: "Seeking Connection for Role",
      time: "Oct 23",
      unread: false,
    },
  ];

  useEffect(() => {
    // Measure the button width when component mounts
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
  }, []);

  const handleToggle = () => {
    setOpen((v) => !v);
  };

  // Open a chat window - if already open, bring to front and expand
  const handleOpenChat = (conv: {
    id: string;
    name: string;
    avatar: string;
  }) => {
    setOpenChats((prev) => {
      const existingIndex = prev.findIndex((chat) => chat.id === conv.id);

      if (existingIndex !== -1) {
        // Chat already open - move to end (front) and ensure it's not minimized
        const updated = [...prev];
        const [chat] = updated.splice(existingIndex, 1);
        return [
          ...updated.map((c) => ({ ...c, isMinimized: true })),
          { ...chat, isMinimized: false },
        ];
      } else {
        // New chat - minimize all others and add this one
        return [
          ...prev.map((c) => ({ ...c, isMinimized: true })),
          {
            id: conv.id,
            name: conv.name,
            avatar: conv.avatar,
            isMinimized: false,
          },
        ];
      }
    });
  };

  // Toggle minimize state of a chat
  const handleToggleMinimize = (chatId: string) => {
    setOpenChats((prev) => {
      const chat = prev.find((c) => c.id === chatId);
      if (!chat) return prev;

      // If we're expanding this chat, minimize all others
      if (chat.isMinimized) {
        return prev.map((c) =>
          c.id === chatId
            ? { ...c, isMinimized: false }
            : { ...c, isMinimized: true }
        );
      } else {
        // Just minimize this chat
        return prev.map((c) =>
          c.id === chatId ? { ...c, isMinimized: true } : c
        );
      }
    });
  };

  // Close a chat window
  const handleCloseChat = (chatId: string) => {
    setOpenChats((prev) => prev.filter((chat) => chat.id !== chatId));
  };

  return (
    <div
      aria-expanded={open}
      className="fixed right-4 bottom-0 z-50 flex flex-col items-stretch transition-all duration-200 ease-out"
    >
      {/* Expanded conversation list - slides up */}
      <ChatList
        conversations={conversations}
        isOpen={open}
        width={buttonWidth}
        onToggle={handleToggle}
        onSelectChat={handleOpenChat}
      />

      {/* Fixed bottom tab - always visible */}
      {!open && (
        <div
          ref={buttonRef}
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer bg-white shadow-2xl 
          ${
            open ? "rounded-t-none" : "rounded-t-xl"
          } transition-all duration-200 hover:shadow-xl`}
          onClick={handleToggle}
          role="button"
          aria-label={open ? "Close chat" : "Open chat"}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleToggle();
            }
          }}
        >
          <Avatar className="h-7 w-7 flex-shrink-0">
            <AvatarImage src="" alt="Messaging" />
            <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-sm font-medium">
              M
            </AvatarFallback>
          </Avatar>
          <div className="w-full flex flex-col items-start min-w-0 mr-18">
            <div className="text-sm font-semibold">Messaging</div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Handle more options
              }}
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
              }}
              aria-label={open ? "Minimize" : "Expand chat"}
            >
              <ChevronUp
                className={`h-4 w-4 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>
        </div>
      )}

      {/* Individual chat windows - positioned to the left of main chat */}
      <div
        className="fixed bottom-0 z-40 flex flex-row-reverse items-end gap-2"
        style={{ right: `${buttonWidth + 20}px` }}
      >
        {openChats.map((chat) => (
          <IndividualChat
            key={chat.id}
            id={chat.id}
            name={chat.name}
            avatar={chat.avatar}
            isMinimized={chat.isMinimized}
            onToggleMinimize={handleToggleMinimize}
            onClose={handleCloseChat}
          />
        ))}
      </div>
    </div>
  );
}
