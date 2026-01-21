/**
 * Chat Interface Component
 *
 * Main container component for the chat interface.
 * Manages state, handles message sending, and coordinates child components.
 */

'use client';

import { useEffect, useState } from 'react';
import { ChatInterfaceProps } from '../../../lib/types/chat';
// import { useChat } from '../../../lib/hooks/useChat';
import { useChat } from '../../../lib/contexts/ChatContext';
import { useAuth } from '../../../lib/hooks/useAuth';
import { useConversations } from '../../../lib/hooks/useConversations';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ErrorDisplay from './ErrorDisplay';
import ConversationList from './ConversationList';
import { validateDomain } from '../../../lib/utils/domain-validator';

export default function ChatInterface({
  className = '',
  onError,
}: ChatInterfaceProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    messages,
    isSending,
    error,
    sendMessage,
    retryMessage,
    clearError,
    approveToolAction,
    rejectToolAction,
    createNewConversation,
  } = useChat();
  const {
    conversations,
    currentConversationId,
    selectConversation,
  } = useConversations();

  // Sidebar state for mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Domain validation on mount
  useEffect(() => {
    const validation = validateDomain();
    if (!validation.isValid) {
      console.error('[ChatInterface] Domain validation failed:', validation.error);
    }
  }, []);

  // Handle authentication loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="text-4xl">🔐</div>
          <p className="text-[var(--color-foreground-light)]">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Handle unauthenticated state
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="text-4xl">🔒</div>
          <h2 className="text-xl font-bold text-[var(--color-foreground)]">
            Authentication Required
          </h2>
          <p className="text-[var(--color-foreground-light)]">
            Please log in to access the chat interface.
          </p>
        </div>
      </div>
    );
  }

  // Handle message send
  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage(message);
    } catch (err) {
      onError?.(err as any);
    }
  };

  // Handle tool call approval
  const handleApproveToolCall = async (toolCallId: string) => {
    try {
      await approveToolAction(toolCallId);
    } catch (err) {
      onError?.(err as any);
    }
  };

  // Handle tool call rejection
  const handleRejectToolCall = async (toolCallId: string) => {
    try {
      await rejectToolAction(toolCallId);
    } catch (err) {
      onError?.(err as any);
    }
  };

  return (
    <div className={`flex h-full ${className}`}>
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-80 flex-shrink-0">
        <ConversationList
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={selectConversation}
          onNewConversation={createNewConversation}
        />
      </div>

      {/* Sidebar - Mobile (Overlay) */}
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-80 z-50 lg:hidden">
            <ConversationList
              conversations={conversations}
              currentConversationId={currentConversationId}
              onSelectConversation={(id: number) => {
                selectConversation(id);
                setIsSidebarOpen(false);
              }}
              onNewConversation={() => {
                createNewConversation();
                setIsSidebarOpen(false);
              }}
            />
          </div>
        </>
      )}

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 h-full bg-[var(--color-background)]">
        {/* Header */}
      <div className="flex-shrink-0 border-b border-[var(--color-border)] bg-[var(--color-background)] px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🤖</div>
            <div>
              <h1 className="text-lg font-bold text-[var(--color-foreground)]">
                AI Assistant
              </h1>
              <p className="text-sm text-[var(--color-foreground-light)]">
                Your intelligent todo helper
              </p>
            </div>
          </div>

          {/* Actions & User Info */}
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle (Mobile) */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-[var(--color-muted)] transition-colors"
              aria-label="Toggle conversation list"
            >
              <svg
                className="w-5 h-5 text-[var(--color-foreground)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* New Conversation Button */}
            <button
              onClick={createNewConversation}
              className="px-3 py-2 text-sm font-medium bg-[var(--color-primary)] text-[var(--color-secondary)] rounded-md hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center gap-2"
              aria-label="Start new conversation"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden sm:inline">New Chat</span>
            </button>

            {/* User Info */}
            <div className="flex items-center gap-2">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-[var(--color-foreground)]">
                  {user.name || user.email}
                </p>
                <p className="text-xs text-[var(--color-foreground-light)]">
                  Online
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-secondary)] font-semibold">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex-shrink-0 px-4 pt-4">
          <ErrorDisplay
            error={error}
            onRetry={retryMessage}
            onDismiss={clearError}
          />
        </div>
      )}

      {/* Messages Area */}
      <ChatMessages
        messages={messages}
        isLoading={isSending}
        className="flex-1"
      />

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-[var(--color-border)] bg-[var(--color-background)] px-4 py-4">
        <ChatInput
          disabled={isSending}
          placeholder="Ask me anything about your todos..."
          onSend={handleSendMessage}
        />
      </div>
      </div>
    </div>
  );
}
