# Stage 1: Dependencies
FROM node:20-alpine AS deps

# Metadata labels for container identification and traceability
LABEL org.opencontainers.image.title="Todo App Frontend"
LABEL org.opencontainers.image.description="Next.js frontend for Todo application"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="Todo App"
LABEL org.opencontainers.image.source="https://github.com/MuhammadTayyab8/hackathon-todo-application"
LABEL org.opencontainers.image.created="2026-02-01"
LABEL maintainer="MuhammadTayyab8"

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Build Next.js application (standalone mode configured in next.config.ts)
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Create non-root user (node user already exists in alpine with UID 1000)
# Copy standalone output
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run the application
CMD ["node", "server.js"]
