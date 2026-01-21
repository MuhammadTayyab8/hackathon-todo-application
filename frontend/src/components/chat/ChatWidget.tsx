/**
 * ChatWidget Component
 *
 * Floating chat widget that can be toggled open/closed.
 * Displays a floating icon in the bottom-left corner and shows
 * the custom chat interface in a modal overlay when opened.
 *
 * Task: T020, T022, T023, T024
 */

'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { CustomChatUI } from './CustomChatUI';

interface ChatWidgetProps {
  className?: string;
}

export function ChatWidget({ className = '' }: ChatWidgetProps) {
  // T022: Add open/close state management
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setHasError(false);
  };


  // modal close
  const handleClose = () => {
    setIsOpen(false);
  };

  const handleError = (error: Error) => {
    console.error('Chat widget error:', error);
    setHasError(true);
  };

  return (
    <>
      {/* T023: Style floating chat icon (bottom-left, primary color) with Tailwind CSS */}
      {!isOpen && (
        <button
          onClick={handleToggle}
          className={`
            fixed bottom-6 left-6 z-50
            flex items-center justify-center
            w-14 h-14
            bg-secondary hover:bg-secondary/90
            text-primary
            rounded-full
            shadow-lg hover:shadow-xl
            transition-all duration-200
            hover:scale-110
            focus:outline-none focus:ring-4 focus:ring-secondary/50
            ${className}
          `}
          aria-label="Open chat"
          title="Chat with AI Assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* T024: Style chat modal overlay with proper z-index and positioning */}
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Chat modal container */}
          <div
            className="fixed bottom-6 left-6 z-50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal card */}
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden w-[400px] h-[600px] flex flex-col">
              {/* Header with close button */}
              <div className="flex items-center justify-between px-4 py-3 bg-secondary text-primary">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <h4 className="text-lg font-semibold">Todo App</h4>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-secondary/90 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Custom Chat UI content */}
              <div className="flex-1 overflow-hidden">
                <CustomChatUI className="h-full w-full" />
              </div>

              {/* Error indicator (if needed) */}
              {hasError && (
                <div className="px-4 py-2 bg-red-50 border-t border-red-200">
                  <p className="text-sm text-red-600">
                    Connection issue. Please try again.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Mobile responsive styles */}
      <style jsx>{`
        @media (max-width: 640px) {
          .fixed.bottom-6.left-6 {
            bottom: 1rem;
            left: 1rem;
          }

          .w-\\[400px\\] {
            width: calc(100vw - 2rem);
            max-width: 400px;
          }

          .h-\\[600px\\] {
            height: calc(100vh - 8rem);
            max-height: 600px;
          }
        }
      `}</style>
    </>
  );
}
