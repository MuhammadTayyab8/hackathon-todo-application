/**
 * Chat Messages Component
 *
 * Displays the list of messages in a conversation with auto-scroll functionality.
 * Handles message rendering and scroll behavior.
 */

'use client';

import { useEffect, useRef } from 'react';
import { ChatMessagesProps } from '@/lib/types/chat';
import ChatMessage from './ChatMessage';
import LoadingIndicator from './LoadingIndicator';

export default function ChatMessages({
  messages,
  isLoading = false,
  className = '',
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto px-4 py-6 space-y-4 ${className}`}
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      {/* Empty State */}
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="max-w-md space-y-4">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
              Start a Conversation
            </h2>
            <p className="text-[var(--color-foreground-light)]">
              Send a message to begin chatting with your AI assistant. Ask questions,
              request help with tasks, or get assistance with your todos.
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-[80%] md:max-w-[70%]">
            <LoadingIndicator message="AI is thinking..." />
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
