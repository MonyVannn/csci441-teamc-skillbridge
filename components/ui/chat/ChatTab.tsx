"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChatList, { type Conversation } from "@/components/ui/chat/ChatList";
import IndividualChat from "@/components/ui/chat/IndividualChat";
import { getConversations, getUnreadCount } from "@/lib/actions/chat";
import { chatEventBus } from "@/lib/chat-events";
import { useUserAuth } from "@/lib/stores/userStore";

type ChatWindow = {
  id: string;
  userId?: string;
  clerkId: string;
  name: string;
  avatar: string;
  isMinimized: boolean;
  isNewChat?: boolean;
};

export default function ChatTab() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [buttonWidth, setButtonWidth] = useState(300);
  const [openChats, setOpenChats] = useState<ChatWindow[]>([]); // Track open individual chats
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated } = useUserAuth();

  // Load conversations and unread count when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
      loadUnreadCount();
    }
  }, [isAuthenticated]);

  // Adaptive polling: poll more frequently when chat is active, less when idle
  useEffect(() => {
    if (!isAuthenticated) return;

    // When chat list is open OR individual chats are open: poll frequently (5s)
    // When everything is closed: poll less frequently for background notifications (20s)
    const pollInterval = open || openChats.length > 0 ? 5000 : 20000;

    const interval = setInterval(() => {
      loadUnreadCount();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [isAuthenticated, open, openChats.length]);

  // Measure button width
  useEffect(() => {
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
  }, []);

  // Open a new chat window with a user (no existing conversation)
  const openNewChatWindow = useCallback(
    (userId: string, clerkId: string, userName: string, userAvatar: string) => {
      setOpenChats((prev) => {
        // Check if chat window is already open with this user
        const existingIndex = prev.findIndex(
          (chat) => chat.userId === userId || chat.id === userId
        );

        if (existingIndex !== -1) {
          // Chat already open - bring to front and expand
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
              id: userId, // Use userId as temporary ID
              userId: userId,
              clerkId: clerkId,
              name: userName,
              avatar: userAvatar,
              isMinimized: false,
              isNewChat: true, // Flag this as a new chat
            },
          ];
        }
      });
    },
    []
  );

  // Open a chat window from conversation list (existing conversation)
  const handleOpenChat = useCallback(
    (conv: { id: string; name: string; avatar: string; clerkId?: string }) => {
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
          // New chat from existing conversation - minimize all others and add this one
          return [
            ...prev.map((c) => ({ ...c, isMinimized: true })),
            {
              id: conv.id,
              clerkId: conv.clerkId || "", // Use clerkId from conversation
              name: conv.name,
              avatar: conv.avatar,
              isMinimized: false,
              isNewChat: false, // This is an existing conversation
            },
          ];
        }
      });
    },
    []
  );

  // Handle selecting a user from search (wrapper for openNewChatWindow)
  const handleSelectUser = useCallback(
    (user: {
      userId: string;
      clerkId: string;
      name: string;
      avatar: string;
    }) => {
      openNewChatWindow(user.userId, user.clerkId, user.name, user.avatar);
    },
    [openNewChatWindow]
  );

  // Listen for global chat events
  useEffect(() => {
    const unsubscribe = chatEventBus.subscribe(async (event) => {
      if (event.type === "OPEN_CHAT") {
        // Refresh conversations first to check for existing ones
        const freshConversations = await getConversations();
        setConversations(freshConversations);

        // Check if conversation exists with this user
        const existingConversation = freshConversations.find(
          (conv) => conv.otherUserId === event.userId
        );

        if (existingConversation) {
          // Open existing conversation
          handleOpenChat({
            id: existingConversation.id,
            name: existingConversation.name,
            avatar: existingConversation.avatar,
            clerkId: existingConversation.otherUserClerkId,
          });
        } else {
          // Open new chat (no conversation exists yet)
          openNewChatWindow(
            event.userId,
            event.clerkId,
            event.userName,
            event.userAvatar || ""
          );
        }
      }
    });

    return unsubscribe;
  }, [handleOpenChat, openNewChatWindow]); // Added dependencies to satisfy exhaustive-deps

  const loadConversations = useCallback(async () => {
    try {
      const fetchedConversations = await getConversations();
      setConversations(fetchedConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
    }
  }, []);

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  }, []);

  const handleToggle = () => {
    setOpen((v) => !v);
    if (!open) {
      // Refresh conversations when opening
      loadConversations();
      loadUnreadCount();
    }
  };

  // Handle when a conversation is created from a new chat
  const handleConversationCreated = (
    oldId: string,
    newConversationId: string
  ) => {
    setOpenChats((prev) =>
      prev.map((chat) =>
        chat.id === oldId
          ? { ...chat, id: newConversationId, isNewChat: false }
          : chat
      )
    );
    // Refresh conversation list to include the new conversation
    loadConversations();
    loadUnreadCount();
  };

  // Handle when a message is sent - refresh conversations and unread count
  const handleMessageSent = useCallback(() => {
    loadConversations();
    loadUnreadCount();
  }, [loadConversations, loadUnreadCount]);

  // Handle when messages are read - refresh unread count
  const handleMessagesRead = useCallback(() => {
    loadUnreadCount();
    loadConversations(); // Also refresh to update the unread indicator in the list
  }, [loadConversations, loadUnreadCount]);

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

  if (!isAuthenticated) return null;

  return (
    <div
      aria-expanded={open}
      className="fixed right-4 shadow-2xl bottom-0 z-50 flex flex-col items-stretch transition-all duration-200 ease-out"
    >
      {/* Expanded conversation list - slides up */}
      <ChatList
        conversations={conversations}
        isOpen={open}
        width={buttonWidth}
        avatar={user?.imageUrl || ""}
        onToggle={handleToggle}
        onSelectChat={handleOpenChat}
        onSelectUser={handleSelectUser}
        onRefresh={loadConversations}
      />

      {/* Fixed bottom tab - always visible */}
      {!open && (
        <div
          ref={buttonRef}
          className={`flex items-center gap-2 px-3 py-2 cursor-pointer bg-white border
          ${
            open ? "rounded-t-none" : "rounded-t-xl"
          } transition-all duration-200 hover:shadow-xl relative`}
          onClick={handleToggle}
          role="button"
          aria-label={open ? "Close chat" : "Open chat"}
          tabIndex={0}
        >
          <Avatar className="h-7 w-7 flex-shrink-0">
            <AvatarImage src={user?.imageUrl || ""} alt="Messaging" />
            <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-sm font-medium">
              M
            </AvatarFallback>
          </Avatar>
          <div className="w-full flex flex-col items-start min-w-0 mr-16">
            <div className="text-sm font-semibold">Contacts</div>
          </div>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
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
            userId={chat.userId}
            clerkId={chat.clerkId}
            name={chat.name}
            avatar={chat.avatar}
            isMinimized={chat.isMinimized}
            isNewChat={chat.isNewChat}
            onToggleMinimize={handleToggleMinimize}
            onClose={handleCloseChat}
            onConversationCreated={handleConversationCreated}
            onMessageSent={handleMessageSent}
            onMessagesRead={handleMessagesRead}
          />
        ))}
      </div>
    </div>
  );
}
