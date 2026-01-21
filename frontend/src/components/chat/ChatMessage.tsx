/**
 * Chat Message Component
 *
 * Displays individual messages with user/assistant styling, timestamps, and formatting.
 * Supports markdown-like formatting for bold, italic, and code blocks.
 */

'use client';

import { ChatMessageProps } from '@/lib/types/chat';
import ToolConfirmation from './ToolConfirmation';
import ToolCallDisplay from './ToolCallDisplay';

export default function ChatMessage({
  message,
  onApproveToolCall,
  onRejectToolCall,
  className = '',
}: ChatMessageProps) {
  const isUser = message.sender === 'user';

  // Format timestamp
  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return messageDate.toLocaleDateString();
  };

  // Simple markdown-like formatting
  const formatContent = (content: string) => {
    // Split by code blocks first
    const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/g);

    return parts.map((part, index) => {
      // Code block
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).trim();
        return (
          <pre
            key={index}
            className="my-2 p-3 rounded-md bg-[var(--color-muted)] overflow-x-auto"
          >
            <code className="text-sm font-mono">{code}</code>
          </pre>
        );
      }

      // Inline code
      if (part.startsWith('`') && part.endsWith('`')) {
        const code = part.slice(1, -1);
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded bg-[var(--color-muted)] text-sm font-mono"
          >
            {code}
          </code>
        );
      }

      // Regular text with bold and italic
      const formatted = part
        .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
        .map((segment, i) => {
          if (segment.startsWith('**') && segment.endsWith('**')) {
            return (
              <strong key={i} className="font-semibold">
                {segment.slice(2, -2)}
              </strong>
            );
          }
          if (segment.startsWith('*') && segment.endsWith('*')) {
            return (
              <em key={i} className="italic">
                {segment.slice(1, -1)}
              </em>
            );
          }
          return segment;
        });

      return <span key={index}>{formatted}</span>;
    });
  };

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${className}`}
    >
      <div
        className={`max-w-[80%] md:max-w-[70%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-[var(--chat-message-user-bg)] text-[var(--chat-message-user-text)]'
            : 'bg-[var(--chat-message-assistant-bg)] text-[var(--chat-message-assistant-text)]'
        }`}
      >
        {/* Message Content */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {formatContent(message.content)}
        </div>

        {/* Timestamp */}
        <div
          className={`mt-2 text-xs ${
            isUser
              ? 'text-[var(--chat-message-user-text)] opacity-70'
              : 'text-[var(--color-foreground-light)]'
          }`}
        >
          {formatTime(message.timestamp)}
        </div>

        {/* Tool Calls (if any) */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.toolCalls.map((toolCall) => (
              <div key={toolCall.id}>
                {/* Show confirmation UI for pending tool calls */}
                {toolCall.status === 'pending' && (
                  <ToolConfirmation
                    toolCall={toolCall}
                    onApprove={onApproveToolCall || (() => {})}
                    onReject={onRejectToolCall || (() => {})}
                  />
                )}

                {/* Show result display for non-pending tool calls */}
                {toolCall.status !== 'pending' && (
                  <ToolCallDisplay toolCall={toolCall} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
