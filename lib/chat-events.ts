/**
 * Global chat event system
 * Allows components to trigger chat actions without prop drilling
 */

type ChatEventListener = (data: ChatEventData) => void;

type ChatEventData = {
  type: "OPEN_CHAT";
  userId: string;
  clerkId: string;
  userName: string;
  userAvatar?: string;
};

class ChatEventBus {
  private listeners: ChatEventListener[] = [];

  subscribe(listener: ChatEventListener) {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emit(data: ChatEventData) {
    this.listeners.forEach((listener) => listener(data));
  }
}

export const chatEventBus = new ChatEventBus();

/**
 * Helper function to open a chat with a user
 * Call this from anywhere in your app to open a chat window
 */
export function openChatWithUser(
  userId: string,
  clerkId: string,
  userName: string,
  userAvatar?: string
) {
  chatEventBus.emit({
    type: "OPEN_CHAT",
    userId,
    clerkId,
    userName,
    userAvatar,
  });
}
