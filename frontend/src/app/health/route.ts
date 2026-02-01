import { NextResponse } from 'next/server';

/**
 * Health check endpoint for container orchestration and monitoring.
 * Returns service status, timestamp, and version information.
 */
export async function GET() {
  const healthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'todo-frontend',
    version: '1.0.0',
  };

  return NextResponse.json(healthResponse, { status: 200 });
}
