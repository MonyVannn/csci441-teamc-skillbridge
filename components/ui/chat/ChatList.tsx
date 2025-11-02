"use client";

import React, { useEffect, useState } from "react";
import {
  MoreHorizontal,
  ChevronUp,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export type Conversation = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  otherUserId?: string;
};

type ChatListProps = {
  avatar: string;
  conversations: Conversation[];
  isOpen: boolean;
  width: number;
  onToggle: () => void;
  onSelectChat: (conv: { id: string; name: string; avatar: string }) => void;
  onRefresh: () => void;
};

export default function ChatList({
  conversations,
  isOpen,
  width,
  avatar,
  onToggle,
  onSelectChat,
  onRefresh,
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Auto-refresh conversations every 5 seconds when open
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      onRefresh();
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, onRefresh]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`flex flex-col overflow-hidden bg-card text-card-foreground rounded-t-xl border-t border-l border-r shadow-lg -mb-1
        ${
          isOpen ? "opacity-100" : "h-0 opacity-0 pointer-events-none"
        } transition-all duration-200 ease-in-out`}
      style={{
        width: width,
        height: isOpen ? "620px" : "0px",
      }}
      aria-hidden={!isOpen}
    >
      <>
        <header className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Avatar className="h-7 w-7">
                <AvatarImage src={avatar} alt="Messaging" />
                <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-sm font-medium">
                  M
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-base font-semibold">Messaging</div>
          </div>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="More options"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              aria-label="Minimize"
            >
              <ChevronUp className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        </header>

        {/* Search bar */}
        <div className="px-3 py-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages"
              className="h-9 pl-9 pr-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 h-7 w-7 text-muted-foreground hover:text-foreground"
              aria-label="Filter"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "No conversations found"
                  : "No messages yet. Start a conversation!"}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <Button
                key={conv.id}
                variant="ghost"
                onClick={() => onSelectChat(conv)}
                className="w-full flex items-start gap-3 px-4 py-3 h-auto hover:bg-muted/50 transition-colors justify-start border-b border-border/50 rounded-none"
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={conv.avatar} alt={conv.name} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {conv.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm truncate">
                      {conv.name}
                    </div>
                    <div className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                      {conv.time}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-start gap-2 line-clamp-2">
                    <span className="flex-1">{conv.lastMessage}</span>
                    {conv.unread && (
                      <span className="h-1 w-1 rounded-full bg-primary flex-shrink-0 mt-1"></span>
                    )}
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </>
    </div>
  );
}
