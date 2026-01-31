/**
 * Cookie utility functions for authentication
 */

/**
 * Set authentication cookie on the frontend domain
 * This is needed because backend cookies are set on a different domain
 * and Next.js middleware can only read cookies from its own domain
 */
export function setAuthCookie(token: string) {
  const isProduction = process.env.NODE_ENV === 'production'
  const maxAge = 604800 // 7 days in seconds

  // Build cookie string based on environment
  const cookieAttributes = [
    `auth_token=${token}`,
    'path=/',
    `max-age=${maxAge}`,
    isProduction ? 'SameSite=Lax' : 'SameSite=Lax',
    isProduction ? 'Secure' : '', // Secure flag only in production (HTTPS)
  ].filter(Boolean).join('; ')

  document.cookie = cookieAttributes
}

/**
 * Remove authentication cookie
 */
export function removeAuthCookie() {
  const isProduction = process.env.NODE_ENV === 'production'

  const cookieAttributes = [
    'auth_token=',
    'path=/',
    'max-age=0', // Expire immediately
    isProduction ? 'SameSite=Lax' : 'SameSite=Lax',
    isProduction ? 'Secure' : '',
  ].filter(Boolean).join('; ')

  document.cookie = cookieAttributes
}

/**
 * Get authentication token from cookie
 */
export function getAuthCookie(): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='))

  if (!authCookie) return null

  return authCookie.split('=')[1]
}
