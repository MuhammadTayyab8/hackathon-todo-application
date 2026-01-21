import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const authToken = request.cookies.get('auth_token')?.value

  // Define route types
  const isPublicRoute = ['/', '/signin', '/signup'].includes(path)
  const isProtectedRoute = ['/dashboard', '/tasks', '/categories', '/calendar', '/chat'].some(
    route => path.startsWith(route)
  )

  // Case 1: Protected route without authentication → redirect to signin
  if (isProtectedRoute && !authToken) {
    const signinUrl = new URL('/signin', request.url)
    signinUrl.searchParams.set('redirect', path) // Preserve intended destination
    return NextResponse.redirect(signinUrl)
  }

  // Case 2: Auth pages with authentication → redirect to dashboard
  if (['/signin', '/signup'].includes(path) && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Case 3: Public route or valid auth → allow
  return NextResponse.next()
}

// Configure which routes the proxy runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
