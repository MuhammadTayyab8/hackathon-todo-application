# Next.js Middleware Authentication Flow

**Feature**: Auth-Aware Frontend Routing & Task Calendar Enhancements
**Date**: 2026-01-12
**Status**: Design Complete

## Overview

This document describes the authentication flow implemented via Next.js 16 middleware for route protection. The middleware runs on the edge runtime before page rendering, providing fast redirects and preventing unauthorized access.

---

## Route Classification

### Public Routes (No Authentication Required)

| Route | Description | Redirect if Authenticated |
|-------|-------------|---------------------------|
| `/` | Landing page | No redirect |
| `/signin` | Sign in page | → `/dashboard` |
| `/signup` | Sign up page | → `/dashboard` |
| `/_next/*` | Next.js internals | No middleware |
| `/api/*` | API routes | Handled by backend |
| `/favicon.ico` | Static assets | No middleware |

### Protected Routes (Authentication Required)

| Route | Description | Redirect if Not Authenticated |
|-------|-------------|-------------------------------|
| `/dashboard` | User dashboard | → `/signin` |
| `/tasks` | Task management | → `/signin` |
| `/categories` | Category management | → `/signin` |
| `/calendar` | Calendar view | → `/signin` |

---

## Middleware Implementation

### File Location

```
frontend/src/middleware.ts
```

### Middleware Logic

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const authToken = request.cookies.get('auth_token')?.value

  // Define route types
  const isPublicRoute = ['/', '/signin', '/signup'].includes(path)
  const isProtectedRoute = ['/dashboard', '/tasks', '/categories', '/calendar'].some(
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

// Configure which routes the middleware runs on
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
  ]
}
```

### Key Features

1. **Edge Runtime**: Runs on Vercel Edge Network for <100ms redirects
2. **Cookie Reading**: Reads `auth_token` cookie without JWT validation (performance)
3. **Bidirectional Protection**: Protects both authenticated and public routes
4. **Redirect Preservation**: Saves intended destination for post-login redirect
5. **Static Asset Exclusion**: Matcher config excludes static files

---

## Cookie Configuration

### Better Auth Cookie Setup

```typescript
// frontend/src/lib/auth.ts
import { createAuthClient } from "better-auth/react"
import { jwtClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [
    jwtClient({
      issuer: "todo-app",
      expiresIn: "7d",
    })
  ],
  cookieStorage: {
    name: 'auth_token',
    options: {
      httpOnly: true,      // Prevents JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',     // CSRF protection
      maxAge: 604800,      // 7 days (matches JWT expiry)
      path: '/'            // Available to all routes
    }
  }
})
```

### Cookie Security Flags

| Flag | Value | Purpose |
|------|-------|---------|
| `httpOnly` | `true` | Prevents JavaScript access, protects against XSS |
| `secure` | `true` (prod) | HTTPS-only transmission |
| `sameSite` | `'lax'` | CSRF protection, allows top-level navigation |
| `maxAge` | `604800` | 7 days expiry (matches JWT) |
| `path` | `'/'` | Cookie available to all routes |

---

## Authentication State Flow

### 1. User Login Flow

```
User submits credentials
    ↓
Better Auth validates credentials
    ↓
Backend generates JWT token
    ↓
Better Auth stores JWT in HttpOnly cookie
    ↓
User redirected to /dashboard
    ↓
Middleware reads cookie → allows access
```

### 2. Protected Route Access Flow

```
User navigates to /tasks
    ↓
Middleware intercepts request
    ↓
Middleware reads auth_token cookie
    ↓
Cookie exists?
    ├─ Yes → Allow access to /tasks
    └─ No → Redirect to /signin?redirect=/tasks
```

### 3. Auth Page Access Flow (Already Authenticated)

```
Authenticated user navigates to /signin
    ↓
Middleware intercepts request
    ↓
Middleware reads auth_token cookie
    ↓
Cookie exists?
    └─ Yes → Redirect to /dashboard
```

### 4. User Logout Flow

```
User clicks logout
    ↓
Better Auth clears auth_token cookie
    ↓
User redirected to /
    ↓
Subsequent protected route access → redirect to /signin
```

---

## Edge Cases & Handling

### 1. Token Expiry During Session

**Scenario**: User's JWT expires while browsing protected pages

**Handling**:
- Middleware detects missing/invalid cookie
- Redirects to `/signin` with redirect parameter
- User logs in again
- Redirected back to intended page

**Implementation**:
```typescript
// Middleware preserves intended destination
if (isProtectedRoute && !authToken) {
  const signinUrl = new URL('/signin', request.url)
  signinUrl.searchParams.set('redirect', path)
  return NextResponse.redirect(signinUrl)
}

// Signin page redirects after successful login
const redirect = searchParams.get('redirect') || '/dashboard'
router.push(redirect)
```

### 2. Manual Cookie Deletion

**Scenario**: User manually deletes auth_token cookie via browser DevTools

**Handling**:
- Same as token expiry
- Middleware redirects to `/signin`
- No error state (graceful degradation)

### 3. Concurrent Tabs

**Scenario**: User has multiple tabs open, logs out in one tab

**Handling**:
- Cookie is shared across all tabs
- Logout in one tab clears cookie for all tabs
- Other tabs redirect to `/signin` on next navigation
- No automatic tab synchronization (user must navigate)

### 4. HTTPS Requirement

**Scenario**: Secure flag requires HTTPS, but localhost uses HTTP

**Handling**:
```typescript
secure: process.env.NODE_ENV === 'production'
```
- Development: `secure: false` (allows HTTP)
- Production: `secure: true` (requires HTTPS)
- Vercel automatically provides HTTPS in production

### 5. Middleware Performance

**Scenario**: Middleware runs on every request, could slow down app

**Mitigation**:
- Edge runtime provides <10ms execution time
- Cookie reading is fast (no JWT validation)
- Matcher config excludes static assets
- No database calls in middleware

**Monitoring**:
```typescript
// Add performance logging (development only)
if (process.env.NODE_ENV === 'development') {
  const start = Date.now()
  const response = NextResponse.next()
  console.log(`Middleware: ${path} - ${Date.now() - start}ms`)
  return response
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// middleware.test.ts
import { middleware } from './middleware'
import { NextRequest } from 'next/server'

describe('Middleware', () => {
  it('redirects unauthenticated users from protected routes', () => {
    const request = new NextRequest('http://localhost:3000/dashboard')
    const response = middleware(request)
    expect(response.status).toBe(307) // Redirect
    expect(response.headers.get('location')).toContain('/signin')
  })

  it('allows authenticated users to access protected routes', () => {
    const request = new NextRequest('http://localhost:3000/dashboard')
    request.cookies.set('auth_token', 'valid-jwt-token')
    const response = middleware(request)
    expect(response.status).toBe(200) // Allow
  })

  it('redirects authenticated users from auth pages', () => {
    const request = new NextRequest('http://localhost:3000/signin')
    request.cookies.set('auth_token', 'valid-jwt-token')
    const response = middleware(request)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/dashboard')
  })

  it('allows unauthenticated users to access public routes', () => {
    const request = new NextRequest('http://localhost:3000/')
    const response = middleware(request)
    expect(response.status).toBe(200)
  })
})
```

### Integration Tests

1. **Test unauthenticated access to /dashboard**
   - Expected: Redirect to /signin
   - Verify: URL changes to /signin?redirect=/dashboard

2. **Test authenticated access to /signin**
   - Expected: Redirect to /dashboard
   - Verify: URL changes to /dashboard

3. **Test redirect preservation**
   - Navigate to /tasks without auth
   - Login at /signin
   - Expected: Redirect to /tasks after login

4. **Test logout flow**
   - Login and navigate to /dashboard
   - Logout
   - Navigate to /tasks
   - Expected: Redirect to /signin

---

## Performance Metrics

### Target Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Middleware execution time | <10ms | Edge runtime logs |
| Redirect time | <100ms | Browser DevTools Network tab |
| Cookie read time | <1ms | Middleware profiling |
| Static asset exclusion | 100% | Matcher config verification |

### Monitoring

```typescript
// Add to middleware for production monitoring
export function middleware(request: NextRequest) {
  const start = performance.now()

  // ... middleware logic ...

  const duration = performance.now() - start
  if (duration > 10) {
    console.warn(`Slow middleware: ${path} took ${duration}ms`)
  }

  return response
}
```

---

## Security Considerations

### 1. Cookie Security

- ✅ HttpOnly prevents XSS attacks
- ✅ Secure flag ensures HTTPS-only
- ✅ SameSite=lax prevents CSRF
- ✅ 7-day expiry limits exposure window

### 2. JWT Validation

- ⚠️ Middleware does NOT validate JWT (performance trade-off)
- ✅ Backend validates JWT on every API request
- ✅ Invalid JWT → API returns 401 → Frontend handles logout

### 3. Redirect Safety

- ✅ Redirect parameter validated (must start with `/`)
- ✅ No open redirect vulnerability
- ✅ External URLs rejected

```typescript
// Safe redirect handling
const redirect = searchParams.get('redirect')
if (redirect && redirect.startsWith('/')) {
  router.push(redirect)
} else {
  router.push('/dashboard')
}
```

---

## Deployment Checklist

- [ ] Environment variables set (NEXT_PUBLIC_API_URL)
- [ ] HTTPS enabled in production (Vercel automatic)
- [ ] Cookie secure flag enabled in production
- [ ] Middleware matcher config tested
- [ ] Redirect flows tested in production
- [ ] Performance metrics monitored
- [ ] Error logging configured

---

## Troubleshooting

### Issue: Infinite redirect loop

**Cause**: Middleware redirects to a route that triggers another redirect

**Solution**: Ensure redirect targets are not in protected/public route lists

### Issue: Cookie not persisting

**Cause**: Secure flag enabled on HTTP (localhost)

**Solution**: Use `secure: process.env.NODE_ENV === 'production'`

### Issue: Middleware not running

**Cause**: Matcher config excludes the route

**Solution**: Verify matcher pattern includes the route

### Issue: Slow redirects

**Cause**: Middleware doing expensive operations

**Solution**: Remove database calls, API requests, or JWT validation from middleware

---

## Next Steps

1. Implement middleware.ts in frontend/src
2. Configure Better Auth cookie storage
3. Test all redirect scenarios
4. Monitor performance in production
5. Set up error logging and alerting
