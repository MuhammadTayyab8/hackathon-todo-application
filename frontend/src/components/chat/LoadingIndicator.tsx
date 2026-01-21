/**
 * Loading Indicator Component
 *
 * Displays a loading state during AI processing or data fetching.
 * Provides visual feedback to users while waiting for responses.
 */

'use client';

import { LoadingIndicatorProps } from '@/lib/types/chat';

export default function LoadingIndicator({
  message = 'Processing...',
  className = '',
}: LoadingIndicatorProps) {
  return (
    <div
      className={`flex items-center justify-center gap-3 p-4 ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Animated dots */}
      <div className="flex gap-1.5">
        <div
          className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <div
          className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>

      {/* Loading message */}
      {message && (
        <span className="text-sm text-[var(--color-foreground-light)]">
          {message}
        </span>
      )}

      {/* Screen reader text */}
      <span className="sr-only">Loading, please wait</span>
    </div>
  );
}
