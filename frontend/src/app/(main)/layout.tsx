/**
 * Main Layout Component
 *
 * Shared layout for all main application pages (calendar, categories, dashboard, tasks).
 * Includes Sidebar navigation and floating ChatWidget for AI assistance.
 *
 * Task: T025
 */

import { Sidebar } from '@/components/dashboard/Sidebar';
import { ChatWidget } from '@/components/chat/ChatWidget';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      {/* Sidebar navigation */}
      {/* <Sidebar /> */}

      {/* Main content area */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Floating chat widget - available on all main pages */}
      <ChatWidget />
    </div>
  );
}
