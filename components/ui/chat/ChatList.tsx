"use client";

import React, { useEffect, useState } from "react";
import { ChevronUp, Search, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { searchUsers } from "@/lib/actions/user";

export type Conversation = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  otherUserId?: string;
  otherUserClerkId?: string;
};

export type SearchedUser = {
  id: string;
  clerkId: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
  role: string;
};

type ChatListProps = {
  avatar: string;
  conversations: Conversation[];
  isOpen: boolean;
  width: number;
  onToggle: () => void;
  onSelectChat: (conv: {
    id: string;
    name: string;
    avatar: string;
    clerkId?: string;
  }) => void;
  onSelectUser?: (user: {
    userId: string;
    clerkId: string;
    name: string;
    avatar: string;
  }) => void;
  onRefresh: () => void;
};

export default function ChatList({
  conversations,
  isOpen,
  width,
  avatar,
  onToggle,
  onSelectChat,
  onSelectUser,
  onRefresh,
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedUsers, setSearchedUsers] = useState<SearchedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Check if device is mobile to prevent hydration mismatch
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-refresh conversations every 5 seconds when open
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      onRefresh();
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, onRefresh]);

  // Search for users when search query changes
  useEffect(() => {
    const searchForUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchedUsers([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const users = await searchUsers(searchQuery);
        setSearchedUsers(users);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchedUsers([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchForUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle user click to start a conversation
  const handleUserClick = (user: SearchedUser) => {
    const userName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;

    // Check if a conversation already exists with this user
    const existingConversation = conversations.find(
      (conv) => conv.otherUserId === user.id
    );

    if (existingConversation) {
      // Open existing conversation
      onSelectChat({
        id: existingConversation.id,
        name: existingConversation.name,
        avatar: existingConversation.avatar,
        clerkId: existingConversation.otherUserClerkId,
      });
    } else {
      // Create new chat with user - use onSelectUser if available, otherwise fall back to onSelectChat
      if (onSelectUser) {
        onSelectUser({
          userId: user.id, // Pass database ID for new chat
          clerkId: user.clerkId, // Pass clerkId for profile link
          name: userName,
          avatar: user.imageUrl || "",
        });
      } else {
        // Fallback to onSelectChat (for backward compatibility)
        onSelectChat({
          id: user.id,
          name: userName,
          avatar: user.imageUrl || "",
        });
      }
    }
  };

  return (
    <div
      className={`flex flex-col overflow-hidden bg-card text-card-foreground 
        lg:rounded-t-xl lg:border-t lg:border-l lg:border-r lg:shadow-lg lg:-mb-1
        w-full lg:w-auto
        ${
          isOpen ? "opacity-100" : "h-0 opacity-0 pointer-events-none lg:h-0"
        } transition-all duration-200 ease-in-out`}
      style={{
        width: isMobile ? "100%" : width,
        height: isOpen ? (isMobile ? "100%" : "620px") : "0px",
      }}
      aria-hidden={!isOpen}
    >
      <>
        <header className="hidden lg:flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Avatar className="h-7 w-7">
                <AvatarImage src={avatar} alt="Messaging" />
                <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-sm font-medium">
                  M
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-base font-semibold">Contacts</div>
          </div>
          <div className="flex items-center gap-0.5">
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
              placeholder="Search messages and people"
              className="h-9 pl-9 pr-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversation and User list */}
        <div className="flex-1 overflow-y-auto">
          {/* Messages Section */}
          {filteredConversations.length > 0 && (
            <div>
              <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
                <span>Messages</span>
              </div>
              {filteredConversations.map((conv) => (
                <Button
                  key={conv.id}
                  variant="ghost"
                  onClick={() =>
                    onSelectChat({
                      id: conv.id,
                      name: conv.name,
                      avatar: conv.avatar,
                      clerkId: conv.otherUserClerkId,
                    })
                  }
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
              ))}
            </div>
          )}

          {/* More People Section */}
          {searchQuery && searchedUsers.length > 0 && (
            <div>
              <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
                <span>More People</span>
              </div>
              {searchedUsers.map((user) => (
                <Button
                  key={user.id}
                  variant="ghost"
                  onClick={() => handleUserClick(user)}
                  className="w-full flex items-start gap-3 px-4 py-3 h-auto hover:bg-muted/50 transition-colors justify-start border-b border-border/50 rounded-none"
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage
                      src={user.imageUrl || ""}
                      alt={`${user.firstName} ${user.lastName}`}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      {user.firstName?.charAt(0) || user.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-medium text-sm truncate">
                      {`${user.firstName || ""} ${
                        user.lastName || ""
                      }`.trim() || user.email}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </div>
                    {user.role && (
                      <div className="text-xs text-muted-foreground/70 capitalize mt-0.5">
                        {user.role.toLowerCase() === "business_owner" &&
                          "Business"}
                        {user.role.toLowerCase() === "user" && "Student"}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}

          {/* Empty States */}
          {!searchQuery && filteredConversations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                No messages yet. Start a conversation!
              </p>
            </div>
          )}

          {searchQuery &&
            filteredConversations.length === 0 &&
            searchedUsers.length === 0 &&
            !isSearching && (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <Search className="h-12 w-12 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No conversations or users found
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Try a different search term
                </p>
              </div>
            )}

          {isSearching && (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <div className="animate-pulse text-sm text-muted-foreground">
                Searching...
              </div>
            </div>
          )}
        </div>
      </>
    </div>
  );
}
