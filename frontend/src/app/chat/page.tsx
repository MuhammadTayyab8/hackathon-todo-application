/**
 * Chat Page
 *
 * Main chat page that renders the ChatInterface component.
 * This is the entry point for the chat feature.
 */

import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <main className="h-full w-full">
      <ChatInterface className="h-full" />
    </main>
  );
}
