/**
 * Error Display Component
 *
 * Displays error messages with retry functionality.
 * Provides user-friendly error messages and recovery options.
 */

'use client';

// import { ErrorDisplayProps, ChatError } from '@/lib/types/chat';
import { ErrorDisplayProps } from '../../../lib/types/chat';

export default function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  className = '',
}: ErrorDisplayProps) {
  // Convert string error to ChatError format
  const errorMessage = typeof error === 'string' ? error : error.message;
  const isRetryable = typeof error === 'string' ? true : error.retryable;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border-2 bg-[var(--chat-tool-error-bg)] border-[var(--chat-tool-error-border)] ${className}`}
      role="alert"
      aria-live="assertive"
    >
      {/* Error Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <svg
          className="w-5 h-5 text-[var(--chat-tool-error-border)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Error Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-foreground)]">
          {errorMessage}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 flex gap-2">
        {isRetryable && onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1.5 text-sm font-medium text-[var(--chat-tool-error-border)] hover:bg-[var(--chat-tool-error-border)] hover:text-white rounded-md transition-colors duration-200"
            aria-label="Retry action"
          >
            Retry
          </button>
        )}

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 text-[var(--color-foreground-light)] hover:text-[var(--color-foreground)] rounded-md transition-colors duration-200"
            aria-label="Dismiss error"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
