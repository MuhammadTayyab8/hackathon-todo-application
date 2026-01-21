/**
 * Tool Call Display Component
 *
 * Displays the execution results of a tool call.
 * Shows success, failure, or rejected status with appropriate styling.
 */

'use client';

import { ToolCallDisplayProps } from '@/lib/types/chat';

export default function ToolCallDisplay({
  toolCall,
  className = '',
}: ToolCallDisplayProps) {
  // Render based on status
  switch (toolCall.status) {
    case 'executed':
      return (
        <div
          className={`p-3 rounded-md bg-[var(--chat-tool-success-bg)] border-2 border-[var(--chat-tool-success-border)] ${className}`}
          role="status"
          aria-live="polite"
        >
          {/* Success Header */}
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-[var(--chat-tool-success-border)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-xs font-semibold text-[var(--chat-tool-success-border)]">
              ✓ Action Executed Successfully
            </p>
          </div>

          {/* Result */}
          {toolCall.result && (
            <div className="text-sm text-[var(--color-foreground)] leading-relaxed">
              {toolCall.result}
            </div>
          )}
        </div>
      );

    case 'failed':
      return (
        <div
          className={`p-3 rounded-md bg-[var(--chat-tool-error-bg)] border-2 border-[var(--chat-tool-error-border)] ${className}`}
          role="alert"
          aria-live="assertive"
        >
          {/* Error Header */}
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-4 h-4 text-[var(--chat-tool-error-border)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <p className="text-xs font-semibold text-[var(--chat-tool-error-border)]">
              ✗ Action Failed
            </p>
          </div>

          {/* Error Message */}
          {toolCall.error && (
            <div className="text-sm text-[var(--color-foreground)] leading-relaxed">
              {toolCall.error}
            </div>
          )}
        </div>
      );

    case 'rejected':
      return (
        <div
          className={`p-3 rounded-md bg-[var(--color-muted)] border-2 border-[var(--color-border)] ${className}`}
          role="status"
          aria-live="polite"
        >
          {/* Rejected Header */}
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-[var(--color-foreground-light)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
            <p className="text-xs font-medium text-[var(--color-foreground-light)]">
              Action Rejected
            </p>
          </div>
        </div>
      );

    case 'approved':
      return (
        <div
          className={`p-3 rounded-md bg-[var(--chat-tool-confirmation-bg)] border-2 border-[var(--chat-tool-confirmation-border)] ${className}`}
          role="status"
          aria-live="polite"
        >
          {/* Approved/Processing Header */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div
                className="w-1.5 h-1.5 rounded-full bg-[var(--chat-tool-confirmation-border)] animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-1.5 h-1.5 rounded-full bg-[var(--chat-tool-confirmation-border)] animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="w-1.5 h-1.5 rounded-full bg-[var(--chat-tool-confirmation-border)] animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
            <p className="text-xs font-medium text-[var(--chat-tool-confirmation-border)]">
              Executing action...
            </p>
          </div>
        </div>
      );

    case 'pending':
    default:
      return null; // Pending state is handled by ToolConfirmation component
  }
}
