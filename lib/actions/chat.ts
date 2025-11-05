"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Get all conversations for the current user
 * Returns conversations sorted by most recent activity
 */
export async function getConversations() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get current user's database ID
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, clerkId: true },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Find all conversations where user is a participant
    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: {
          has: currentUser.id,
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            clerkId: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            readBy: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Format conversations for the UI
    const formattedConversations = conversations.map((conv) => {
      // Get the other participant (not the current user)
      const otherParticipant = conv.participants.find(
        (p) => p.id !== currentUser.id
      );

      const lastMessage = conv.messages[0];
      const unread = lastMessage
        ? !lastMessage.readBy.includes(currentUser.id) &&
          lastMessage.senderId !== currentUser.id
        : false;

      // Format time
      const getTimeString = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
          return new Date(date).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
        } else if (days < 7) {
          return new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
          });
        } else {
          return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        }
      };

      return {
        id: conv.id,
        name: otherParticipant
          ? `${otherParticipant.firstName || ""} ${
              otherParticipant.lastName || ""
            }`.trim() || "Unknown User"
          : "Unknown User",
        avatar: otherParticipant?.imageUrl || "",
        lastMessage: lastMessage
          ? lastMessage.senderId === currentUser.id
            ? `You: ${lastMessage.content}`
            : lastMessage.content
          : "No messages yet",
        time: lastMessage
          ? getTimeString(lastMessage.createdAt)
          : getTimeString(conv.createdAt),
        unread,
        otherUserId: otherParticipant?.id,
        otherUserClerkId: otherParticipant?.clerkId,
      };
    });

    return formattedConversations;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw new Error("Failed to fetch conversations");
  }
}

/**
 * Get or create a conversation between current user and another user
 */
export async function getOrCreateConversation(otherUserId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get current user's database ID
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participantIds: {
              has: currentUser.id,
            },
          },
          {
            participantIds: {
              has: otherUserId,
            },
          },
        ],
      },
      include: {
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    if (existingConversation) {
      const otherParticipant = existingConversation.participants.find(
        (p) => p.id !== currentUser.id
      );

      return {
        id: existingConversation.id,
        name: otherParticipant
          ? `${otherParticipant.firstName || ""} ${
              otherParticipant.lastName || ""
            }`.trim()
          : "Unknown User",
        avatar: otherParticipant?.imageUrl || "",
      };
    }

    // Create new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        participantIds: [currentUser.id, otherUserId],
      },
      include: {
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    const otherParticipant = newConversation.participants.find(
      (p) => p.id !== currentUser.id
    );

    revalidatePath("/");

    return {
      id: newConversation.id,
      name: otherParticipant
        ? `${otherParticipant.firstName || ""} ${
            otherParticipant.lastName || ""
          }`.trim()
        : "Unknown User",
      avatar: otherParticipant?.imageUrl || "",
    };
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw new Error("Failed to create conversation");
  }
}

/**
 * Get all messages in a conversation
 */
export async function getMessages(conversationId: string, limit = 50) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get current user's database ID
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participantIds: {
          has: currentUser.id,
        },
      },
    });

    if (!conversation) {
      throw new Error("Conversation not found or unauthorized");
    }

    // Get messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: limit,
    });

    // Format messages for UI
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      senderName: `${msg.sender.firstName || ""} ${
        msg.sender.lastName || ""
      }`.trim(),
      senderAvatar: msg.sender.imageUrl || "",
      createdAt: msg.createdAt,
      isCurrentUser: msg.senderId === currentUser.id,
      readBy: msg.readBy,
    }));

    return formattedMessages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw new Error("Failed to fetch messages");
  }
}

/**
 * Send a new message in a conversation
 */
export async function sendMessage(conversationId: string, content: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!content.trim()) {
    throw new Error("Message content cannot be empty");
  }

  try {
    // Get current user's database ID
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participantIds: {
          has: currentUser.id,
        },
      },
    });

    if (!conversation) {
      throw new Error("Conversation not found or unauthorized");
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: currentUser.id,
        conversationId,
        readBy: [currentUser.id], // Sender has automatically "read" their own message
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    // Update conversation's lastMessage fields
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: message.createdAt,
        lastMessagePreview: content.substring(0, 100),
        lastMessageSender: `${currentUser.firstName || ""} ${
          currentUser.lastName || ""
        }`.trim(),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/");

    return {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: `${message.sender.firstName || ""} ${
        message.sender.lastName || ""
      }`.trim(),
      senderAvatar: message.sender.imageUrl || "",
      createdAt: message.createdAt,
      isCurrentUser: true,
      readBy: message.readBy,
    };
  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error("Failed to send message");
  }
}

/**
 * Mark messages as read in a conversation
 */
export async function markMessagesAsRead(conversationId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get current user's database ID
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participantIds: {
          has: currentUser.id,
        },
      },
    });

    if (!conversation) {
      throw new Error("Conversation not found or unauthorized");
    }

    // Find messages that current user hasn't read yet
    // Note: MongoDB Prisma doesn't support advanced array filtering in WHERE clause
    // so we fetch messages and filter in application code, but optimize by selecting minimal fields
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        senderId: {
          not: currentUser.id,
        },
      },
      select: {
        id: true,
        readBy: true,
      },
    });

    // Filter messages that current user hasn't read
    const messagesToUpdate = messages.filter(
      (msg) => !msg.readBy.includes(currentUser.id)
    );

    // Batch update all unread messages in a transaction for better performance
    if (messagesToUpdate.length > 0) {
      await prisma.$transaction(
        messagesToUpdate.map((message) =>
          prisma.message.update({
            where: { id: message.id },
            data: {
              readBy: {
                push: currentUser.id,
              },
            },
          })
        )
      );
    }

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw new Error("Failed to mark messages as read");
  }
}

/**
 * Get unread message count for current user
 */
export async function getUnreadCount() {
  const { userId } = await auth();

  if (!userId) {
    return 0;
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!currentUser) {
      return 0;
    }

    // Get all conversations for this user
    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: {
          has: currentUser.id,
        },
      },
      select: {
        id: true,
      },
    });

    const conversationIds = conversations.map((conv) => conv.id);

    // Fetch messages and filter in application code
    // MongoDB Prisma doesn't support NOT with array 'has' in WHERE clause
    const allMessages = await prisma.message.findMany({
      where: {
        conversationId: {
          in: conversationIds,
        },
        senderId: {
          not: currentUser.id,
        },
      },
      select: {
        id: true,
        readBy: true,
      },
    });

    // Count messages where current user is not in readBy array
    const totalUnread = allMessages.filter(
      (msg) => !msg.readBy.includes(currentUser.id)
    ).length;

    return totalUnread;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
}
