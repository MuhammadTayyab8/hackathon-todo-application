/**
 * Chat Input Component
 *
 * Message input component with text input, send button, and character count.
 * Handles user message composition and submission.
 */

'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { ChatInputProps } from '@/lib/types/chat';

const MAX_MESSAGE_LENGTH = 10000;

export default function ChatInput({
  disabled = false,
  placeholder = 'Type your message...',
  onSend,
  className = '',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!message.trim() || disabled) {
      return;
    }

    onSend?.(message);
    setMessage('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    // Enforce max length
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setMessage(value);
    }

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const characterCount = message.length;
  const isNearLimit = characterCount > MAX_MESSAGE_LENGTH * 0.9;
  const isAtLimit = characterCount >= MAX_MESSAGE_LENGTH;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Input Container */}
      <div className="flex items-end gap-2">
        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-[var(--chat-input-border)] bg-[var(--chat-input-bg)] text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-light)] focus:outline-none focus:border-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed resize-none transition-colors duration-200"
            style={{
              minHeight: '48px',
              maxHeight: '200px',
            }}
            aria-label="Message input"
          />

          {/* Character Count (shown when near limit) */}
          {isNearLimit && (
            <div
              className={`absolute bottom-2 right-2 text-xs font-medium ${
                isAtLimit
                  ? 'text-[var(--chat-tool-error-border)]'
                  : 'text-[var(--color-foreground-light)]'
              }`}
              aria-live="polite"
            >
              {characterCount}/{MAX_MESSAGE_LENGTH}
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim() || isAtLimit}
          className="flex-shrink-0 p-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-secondary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
          aria-label="Send message"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>

      {/* Helper Text */}
      <div className="flex items-center justify-between text-xs text-[var(--color-foreground-light)] px-1">
        <span>Press Enter to send, Shift+Enter for new line</span>
        {!isNearLimit && (
          <span className="opacity-0">
            {characterCount}/{MAX_MESSAGE_LENGTH}
          </span>
        )}
      </div>
    </div>
  );
}
