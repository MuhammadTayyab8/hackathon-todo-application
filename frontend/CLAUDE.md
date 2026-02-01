# Frontend Guidelines

## Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Node.js 20+

## Patterns
- Use server components by default
- Client components only when needed (interactivity)
- API calls go through `/lib/api.ts`
- Standalone output mode for Docker optimization

## Component Structure
- `/src/app` - Pages and layouts (App Router)
- `/src/components` - Reusable UI components
- `/src/lib` - Utilities and API client

## API Client
All backend calls should use the api client:
```typescript
import { api } from '@/lib/api'
const tasks = await api.getTasks()
```

## Styling
- Use Tailwind CSS classes
- No inline styles
- Follow existing component patterns

## Running

### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Docker Development
```bash
# Build container
docker build -t todo-frontend:latest .

# Run container
docker run -d \
  --name todo-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://localhost:8000" \
  -e BETTER_AUTH_SECRET="your-secret" \
  -e BETTER_AUTH_URL="http://localhost:3000" \
  todo-frontend:latest

# View logs
docker logs -f todo-frontend

# Stop container
docker stop todo-frontend
```

### Health Check
```bash
curl http://localhost:3000/health
```

## Environment Variables
- `NEXT_PUBLIC_API_URL` - Backend API URL (required)
- `BETTER_AUTH_SECRET` - JWT secret key (required)
- `BETTER_AUTH_URL` - Frontend URL for auth callbacks (required)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)

## Docker Notes
- Container uses multi-stage build for optimization
- Runs as non-root user `node`
- Port 3000 exposed
- Health check endpoint available at `/health`
- Standalone output mode configured in `next.config.ts`
- Image size target: < 200MB

## Next.js Configuration
The `next.config.ts` is configured with:
- `output: 'standalone'` - For optimized Docker builds
- Proper API URL handling for containerized environments

For detailed Docker instructions, see [Docker Quickstart Guide](../specs/001-docker-containerization/quickstart.md).