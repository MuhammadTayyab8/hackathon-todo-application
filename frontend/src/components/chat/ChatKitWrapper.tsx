/**
 * ChatKitWrapper Component
 *
 * Integrates OpenAI ChatKit with custom FastAPI backend.
 * Uses api.url pattern to connect to custom ChatKit server endpoint.
 */

'use client';

import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

interface ChatKitWrapperProps {
  className?: string;
  onError?: (error: Error) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function ChatKitWrapper({ className = '', onError }: ChatKitWrapperProps) {
  const { user, isAuthenticated } = useAuth();
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('🔍 ChatKitWrapper Debug:');
    console.log('  - API_BASE:', API_BASE);
    console.log('  - isAuthenticated:', isAuthenticated);
    console.log('  - user:', user);
    console.log('  - ChatKit endpoint:', `${API_BASE}/api/chatkit`);
  }, [isAuthenticated, user]);

  // IMPORTANT: Call all hooks BEFORE any conditional returns
  // Connect to custom backend using api.url pattern
  const { control } = useChatKit({
    api: {
      // Connect to our custom FastAPI ChatKit endpoint
      url: `${API_BASE}/api/chatkit`,
      domainKey: 'local-dev', // Optional in development
    },
    // Error handling
    onError: ({ error }) => {
      const errorMsg = error?.message || 'An error occurred in the chat';
      console.error('❌ ChatKit error:', error);
      setSessionError(errorMsg);

      if (onError && error) {
        onError(error);
      }
    },
    // Theme configuration
    theme: {
      colorScheme: 'light',
      radius: 'soft',
      density: 'normal',
      color: {
        accent: {
          primary: '#3b82f6', // blue-600
          level: 2,
        },
      },
    },
    // Header configuration
    header: {
      enabled: true,
      // title: {
      //   enabled: true,
      //   text: 'AI Task Assistant',
      // },
    },
    // History/conversation management
    history: {
      enabled: true,
      showDelete: true,
      showRename: true,
    },
    // Start screen with example prompts
    startScreen: {
      greeting: 'Welcome! I can help you manage your tasks.',
      prompts: [
        'Add a task to buy groceries tomorrow',
        'Show me my pending tasks',
        'Mark the first task as complete',
      ],
    },
  });

  useEffect(() => {
    console.log('🔍 ChatKit control object:', control);
  }, [control]);

  // NOW do conditional rendering AFTER all hooks are called
  // Check authentication
  if (!isAuthenticated || !user?.id) {
    console.log('⚠️ Not authenticated - showing auth required message');
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center space-y-4 p-6">
          <div className="text-4xl">🔒</div>
          <h3 className="text-lg font-semibold text-gray-900">Authentication Required</h3>
          <p className="text-sm text-gray-600">Please sign in to use the chat.</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (sessionError) {
    console.log('⚠️ Session error:', sessionError);
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center space-y-4 p-6 border rounded-xl bg-red-50">
          <div className="text-4xl">⚠️</div>
          <h3 className="text-lg font-semibold text-red-900">Chat Unavailable</h3>
          <p className="text-sm text-red-600">{sessionError}</p>
          <button
            onClick={() => {
              setSessionError(null);
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render ChatKit with explicit dimensions and debug border
  console.log('✅ Rendering ChatKit component');
  return (
    <div
      className={className || "h-[600px] w-full"}
      style={{
        border: '2px solid red',
        minHeight: '600px',
        backgroundColor: '#f0f0f0'
      }}
    >
      <ChatKit
        control={control}
        className="h-full w-full"
      />
    </div>
  );
}