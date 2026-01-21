/**
 * Conversation Item Component
 *
 * Displays a single conversation item in the conversation list.
 * Shows last message preview, timestamp, and active state.
 */

'use client';

import { ConversationItemProps } from '@/lib/types/chat';

export default function ConversationItem({
  conversation,
  isActive,
  onClick,
  className = '',
}: ConversationItemProps) {
  // Format timestamp
  const formatTime = (date: Date) => {
    const now = new Date();
    const conversationDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - conversationDate.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return conversationDate.toLocaleDateString();
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
        isActive
          ? 'bg-[var(--color-primary)] text-[var(--color-secondary)]'
          : 'bg-transparent hover:bg-[var(--color-muted)] text-[var(--color-foreground)]'
      } ${className}`}
      aria-label={`Select conversation from ${formatTime(conversation.updatedAt)}`}
      aria-current={isActive ? 'true' : 'false'}
    >
      {/* Conversation Header */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="text-lg">💬</div>
          <span
            className={`text-xs font-medium truncate ${
              isActive
                ? 'text-[var(--color-secondary)]'
                : 'text-[var(--color-foreground-light)]'
            }`}
          >
            {formatTime(conversation.updatedAt)}
          </span>
        </div>
        <span
          className={`text-xs font-medium flex-shrink-0 ${
            isActive
              ? 'text-[var(--color-secondary)] opacity-80'
              : 'text-[var(--color-foreground-light)]'
          }`}
        >
          {conversation.messageCount} msg{conversation.messageCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Last Message Preview */}
      {conversation.lastMessage && (
        <p
          className={`text-sm line-clamp-2 ${
            isActive
              ? 'text-[var(--color-secondary)] opacity-90'
              : 'text-[var(--color-foreground-light)]'
          }`}
        >
          {conversation.lastMessage}
        </p>
      )}

      {/* Empty State */}
      {!conversation.lastMessage && (
        <p
          className={`text-sm italic ${
            isActive
              ? 'text-[var(--color-secondary)] opacity-70'
              : 'text-[var(--color-foreground-light)]'
          }`}
        >
          No messages yet
        </p>
      )}
    </button>
  );
}
