/**
 * Tool Confirmation Component
 *
 * Displays a tool action proposal with approve/reject buttons.
 * Provides clear description of what the tool will do.
 */

'use client';

import { ToolConfirmationProps } from '@/lib/types/chat';

export default function ToolConfirmation({
  toolCall,
  onApprove,
  onReject,
  className = '',
}: ToolConfirmationProps) {
  return (
    <div
      className={`p-4 rounded-lg border-2 bg-[var(--chat-tool-confirmation-bg)] border-[var(--chat-tool-confirmation-border)] ${className}`}
      role="alert"
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg
            className="w-5 h-5 text-[var(--chat-tool-confirmation-border)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-1">
            🔧 Proposed Action
          </h3>
          <p className="text-sm text-[var(--color-foreground)] leading-relaxed">
            {toolCall.description}
          </p>
        </div>
      </div>

      {/* Parameters (if any) */}
      {toolCall.parameters && Object.keys(toolCall.parameters).length > 0 && (
        <div className="mb-3 p-2 rounded bg-white/50 border border-[var(--chat-tool-confirmation-border)]/20">
          <p className="text-xs font-medium text-[var(--color-foreground-light)] mb-1">
            Parameters:
          </p>
          <div className="space-y-1">
            {Object.entries(toolCall.parameters).map(([key, value]) => (
              <div key={key} className="flex gap-2 text-xs">
                <span className="font-medium text-[var(--color-foreground)]">
                  {key}:
                </span>
                <span className="text-[var(--color-foreground-light)]">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onApprove(toolCall.id)}
          className="flex-1 px-4 py-2 text-sm font-medium bg-[var(--chat-tool-success-border)] text-white rounded-md hover:opacity-90 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--chat-tool-success-border)] focus:ring-offset-2"
          aria-label={`Approve action: ${toolCall.description}`}
        >
          ✓ Approve
        </button>
        <button
          onClick={() => onReject(toolCall.id)}
          className="flex-1 px-4 py-2 text-sm font-medium bg-[var(--chat-tool-error-border)] text-white rounded-md hover:opacity-90 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--chat-tool-error-border)] focus:ring-offset-2"
          aria-label={`Reject action: ${toolCall.description}`}
        >
          ✗ Reject
        </button>
      </div>

      {/* Helper Text */}
      <p className="mt-2 text-xs text-[var(--color-foreground-light)] text-center">
        Review the action carefully before approving
      </p>
    </div>
  );
}
