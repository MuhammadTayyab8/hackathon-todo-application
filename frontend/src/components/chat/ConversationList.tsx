/**
 * Conversation List Component
 *
 * Displays a list of user's conversations in a sidebar layout.
 * Allows users to select and switch between conversations.
 */

'use client';

import { ConversationListProps } from '@/lib/types/chat';
import ConversationItem from './ConversationItem';

export default function ConversationList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  className = '',
}: ConversationListProps) {
  return (
    <div
      className={`flex flex-col h-full bg-[var(--color-background)] border-r border-[var(--color-border)] ${className}`}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[var(--color-foreground)]">
            Conversations
          </h2>
          <button
            onClick={onNewConversation}
            className="p-2 rounded-md bg-[var(--color-primary)] text-[var(--color-secondary)] hover:opacity-90 active:scale-95 transition-all duration-200"
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
          </button>
        </div>
        <p className="text-xs text-[var(--color-foreground-light)]">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm text-[var(--color-foreground-light)]">
              No conversations yet
            </p>
            <p className="text-xs text-[var(--color-foreground-light)] mt-1">
              Start a new chat to begin
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === currentConversationId}
                onClick={() => onSelectConversation(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
