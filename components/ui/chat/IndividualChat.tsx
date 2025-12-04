"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Minus, ChevronUp, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "../separator";
import {
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getOrCreateConversation,
} from "@/lib/actions/chat";
import { Textarea } from "../textarea";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type IndividualChatProps = {
  id: string;
  userId?: string;
  clerkId?: string;
  name: string;
  avatar: string;
  isMinimized: boolean;
  isNewChat?: boolean;
  onToggleMinimize: (chatId: string) => void;
  onClose: (chatId: string) => void;
  onConversationCreated?: (oldId: string, newConversationId: string) => void;
  onMessageSent?: () => void;
  onMessagesRead?: () => void;
};

type Message = {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  createdAt: Date;
  isCurrentUser: boolean;
};

export default function IndividualChat({
  id,
  userId,
  clerkId,
  name,
  avatar,
  isMinimized,
  isNewChat = false,
  onToggleMinimize,
  onClose,
  onConversationCreated,
  onMessageSent,
  onMessagesRead,
}: IndividualChatProps) {
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(
    isNewChat ? null : id
  );
  const [showCloseAlert, setShowCloseAlert] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasScrolledToBottomRef = useRef(false);

  // Define loadMessages with useCallback to prevent unnecessary re-renders
  const loadMessages = useCallback(
    async (silent = false) => {
      if (!conversationId) return; // Can't load messages without a conversation

      if (!silent) setIsLoading(true);

      try {
        const fetchedMessages = await getMessages(conversationId);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [conversationId]
  );

  // Load messages when chat opens or is expanded (only if conversation exists)
  useEffect(() => {
    if (!isMinimized && conversationId) {
      loadMessages();
      // Mark messages as read
      markMessagesAsRead(conversationId).then(() => {
        // Notify parent to refresh conversations and unread count
        if (onMessagesRead) {
          onMessagesRead();
        }
      });
    }
  }, [conversationId, isMinimized, loadMessages, onMessagesRead]);

  // Scroll to bottom when messages first load
  useEffect(() => {
    if (messages.length > 0 && !hasScrolledToBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      hasScrolledToBottomRef.current = true;
    }
  }, [messages]);

  // Reset scroll flag when chat is minimized/closed
  useEffect(() => {
    if (isMinimized) {
      hasScrolledToBottomRef.current = false;
    }
  }, [isMinimized]);

  // Poll for new messages every 3 seconds when chat is open (only if conversation exists)
  useEffect(() => {
    if (isMinimized || !conversationId) return;

    const interval = setInterval(() => {
      loadMessages(true); // Silent reload
    }, 3000);

    return () => clearInterval(interval);
  }, [conversationId, isMinimized, loadMessages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSending) return;

    setIsSending(true);
    const tempMessage = messageInput;
    setMessageInput(""); // Clear input immediately for better UX

    try {
      // If this is a new chat, create the conversation first
      if (isNewChat && !conversationId && userId) {
        const conversation = await getOrCreateConversation(userId);
        setConversationId(conversation.id);

        // Notify parent that conversation was created
        if (onConversationCreated) {
          onConversationCreated(id, conversation.id);
        }

        // Now send the message with the new conversation ID
        const newMessage = await sendMessage(conversation.id, tempMessage);
        setMessages([newMessage]);

        // Notify parent to refresh conversations
        if (onMessageSent) {
          onMessageSent();
        }
      } else if (conversationId) {
        // Normal flow - conversation already exists
        const newMessage = await sendMessage(conversationId, tempMessage);
        setMessages((prev) => [...prev, newMessage]);

        // Notify parent to refresh conversations
        if (onMessageSent) {
          onMessageSent();
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore message input on error
      setMessageInput(tempMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseChat = () => {
    if (messageInput.trim()) {
      setShowCloseAlert(true);
    } else {
      onClose(id);
    }
  };

  const confirmCloseChat = () => {
    setShowCloseAlert(false);
    onClose(id);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className={`shadow-lg border flex flex-col overflow-hidden
        lg:rounded-t-xl lg:rounded-b-none
        ${
          isMinimized ? "lg:w-[230px] lg:h-[48px]" : "lg:w-[360px] lg:h-[500px]"
        }
        fixed lg:relative
        inset-0 lg:inset-auto
        z-50 lg:z-auto
        bg-white
        h-screen lg:h-auto`}
    >
      {/* Chat header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-white">
        <Link
          href={`/profile/${clerkId}`}
          className={`flex items-center gap-2 min-w-0 group cursor-pointer ${
            isMinimized ? "overflow-hidden" : ""
          }`}
        >
          <Avatar className="h-7 w-7 flex-shrink-0">
            <AvatarImage src={avatar} alt="Messaging" />
            <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-sm font-medium">
              {avatar}
            </AvatarFallback>
          </Avatar>
          <div className="text-sm font-semibold line-clamp-1 group-hover:underline">
            {name}
          </div>
        </Link>
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
            onClick={handleCloseChat}
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
          <div className="h-[calc(100vh-120px)] lg:h-[400px] overflow-y-auto px-4 py-3 bg-white flex-shrink-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">
                  Loading messages...
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((message, index) => {
                  const showSeparator =
                    index > 0 &&
                    messages[index - 1].senderId !== message.senderId;

                  return (
                    <React.Fragment key={message.id}>
                      {showSeparator && <Separator />}
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 flex-shrink-0">
                            <AvatarImage
                              src={message.senderAvatar}
                              alt={message.senderName}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-sm font-medium">
                              {message.senderName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-semibold text-foreground">
                            {message.isCurrentUser ? "You" : message.senderName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                        <div className="w-full text-sm text-foreground leading-relaxed ml-9 whitespace-pre-wrap break-words pr-10">
                          {message.content}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="px-2 py-2 border-t bg-card">
            <div className="flex gap-2 items-end">
              <Textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Write a message..."
                className="h-9 text-sm"
                disabled={isSending}
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
                variant={"ghost"}
                className="h-9 w-9 flex-shrink-0"
                disabled={!messageInput.trim() || isSending}
                aria-label="Send message"
              >
                <SendHorizonal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Unsaved changes alert */}
      <AlertDialog open={showCloseAlert} onOpenChange={setShowCloseAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Message</AlertDialogTitle>
            <AlertDialogDescription>
              You have an unsaved message. Are you sure you want to close this
              chat? Your message will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCloseChat}>
              Close Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
