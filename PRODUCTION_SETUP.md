# Production Deployment Guide

## Issues Fixed

### 1. Cookie Domain Configuration
**Problem**: Cookies were not being saved in production because the `domain` parameter was set to the full URL instead of just the domain name.

**Solution**:
- Properly parse the `FRONTEND_URL` to extract just the domain
- Don't set the `domain` parameter in production (allows cookies to work across subdomains)
- Use `secure=True` and `samesite="none"` in production for cross-origin cookies

### 2. CORS Configuration
**Problem**: CORS was not properly configured with the production frontend URL.

**Solution**:
- Properly handle `FRONTEND_URL` environment variable
- Filter out None values from allowed origins
- Add `expose_headers` to CORS configuration

## Environment Variables Setup

### Backend (Vercel)

Set these environment variables in your Vercel backend project settings:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT Configuration
JWT_SECRET_KEY=your-secure-random-secret-key

# Frontend URL (IMPORTANT: Use your actual frontend Vercel URL)
FRONTEND_URL=https://your-frontend-app.vercel.app

# Environment
ENVIRONMENT=production

# Better Auth Secret (must match frontend)
BETTER_AUTH_SECRET=d90d725c2f20cca9e719082dd3d8468674ac09f68607ec341ea9a46d9b018eac
```

### Frontend (Vercel)

Set these environment variables in your Vercel frontend project settings:

```bash
# Backend API URL (IMPORTANT: Use your actual backend Vercel URL)
NEXT_PUBLIC_API_URL=https://your-backend-app.vercel.app

# Frontend App URL (your frontend domain)
NEXT_PUBLIC_APP_URL=https://your-frontend-app.vercel.app

# Better Auth Secret (must match backend)
BETTER_AUTH_SECRET=d90d725c2f20cca9e719082dd3d8468674ac09f68607ec341ea9a46d9b018eac

# OpenAI Domain Key (if needed)
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=https://your-frontend-app.vercel.app
```

## Deployment Steps

### 1. Deploy Backend First

1. Go to Vercel Dashboard
2. Import your backend repository
3. Set the root directory to `backend`
4. Add all environment variables listed above
5. Deploy

### 2. Deploy Frontend

1. Go to Vercel Dashboard
2. Import your frontend repository
3. Set the root directory to `frontend`
4. Add all environment variables listed above
5. Make sure `NEXT_PUBLIC_API_URL` points to your deployed backend URL
6. Deploy

### 3. Update Environment Variables

After both are deployed:

1. Update backend's `FRONTEND_URL` with the actual frontend Vercel URL
2. Update frontend's `NEXT_PUBLIC_API_URL` with the actual backend Vercel URL
3. Redeploy both if needed

## Cookie Configuration Explained

### Production (Cross-Domain)
```python
secure=True          # Requires HTTPS
samesite="none"      # Allows cross-domain cookies
domain=None          # Don't set domain for cross-origin
httponly=True        # Prevents JavaScript access
```

### Development (Same Domain)
```python
secure=False         # Works with HTTP
samesite="lax"       # Standard CSRF protection
domain="localhost"   # Optional for local development
httponly=True        # Prevents JavaScript access
```

## Testing

### Test Signup Flow
1. Go to your frontend URL: `https://your-frontend-app.vercel.app/signup`
2. Create a new account
3. Check browser DevTools > Application > Cookies
4. You should see `auth_token` cookie with:
   - `Secure` flag enabled
   - `HttpOnly` flag enabled
   - `SameSite=None`

### Test Cookie Persistence
1. After signup, you should be redirected to the main app
2. Refresh the page - you should stay logged in
3. Close and reopen the browser - you should stay logged in

## Troubleshooting

### Cookies Not Saving
- Verify `ENVIRONMENT=production` is set in backend
- Verify `FRONTEND_URL` is set correctly (full URL with https://)
- Check browser console for CORS errors
- Ensure both frontend and backend are using HTTPS

### CORS Errors
- Verify `FRONTEND_URL` in backend matches your actual frontend domain
- Check that `allow_credentials=True` is set in CORS middleware
- Ensure frontend is sending `credentials: 'include'` in fetch requests

### 401 Unauthorized Errors
- Check that cookies are being sent with requests
- Verify JWT_SECRET_KEY is the same across deployments
- Check that the auth_token cookie is present in browser

## Security Notes

1. **Never commit `.env` files** - they contain sensitive secrets
2. **Use strong JWT_SECRET_KEY** - generate with: `openssl rand -hex 32`
3. **Use HTTPS in production** - required for secure cookies
4. **Rotate secrets regularly** - especially after any security incident
5. **Monitor cookie settings** - ensure they match your security requirements

## Local Development

For local development, create a `.env` file in the backend directory:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET_KEY=your-local-secret-key
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
BETTER_AUTH_SECRET=d90d725c2f20cca9e719082dd3d8468674ac09f68607ec341ea9a46d9b018eac
```

Frontend `.env.local` should have:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_SECRET=d90d725c2f20cca9e719082dd3d8468674ac09f68607ec341ea9a46d9b018eac
```
