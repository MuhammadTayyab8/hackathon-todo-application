#!/bin/bash

# Docker Containerization Validation Script
# This script automates the validation of Docker containers for the Todo application
# Run this script once Docker connectivity is restored

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_IMAGE="todo-backend:latest"
FRONTEND_IMAGE="todo-frontend:latest"
BACKEND_CONTAINER="todo-backend-test"
FRONTEND_CONTAINER="todo-frontend-test"
NETWORK_NAME="todo-test-network"

# Test database URL (replace with your actual database)
DATABASE_URL="${DATABASE_URL:-postgresql://user:pass@host.neon.tech/dbname}"
BETTER_AUTH_SECRET="${BETTER_AUTH_SECRET:-test-secret-key-min-32-chars-long-for-testing}"

# Results file
RESULTS_FILE="validation-results.txt"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Docker Containerization Validation${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print success
success() {
    echo -e "${GREEN}✓ $1${NC}"
    echo "✓ $1" >> "$RESULTS_FILE"
}

# Function to print error
error() {
    echo -e "${RED}✗ $1${NC}"
    echo "✗ $1" >> "$RESULTS_FILE"
}

# Function to print info
info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Function to cleanup
cleanup() {
    info "Cleaning up test containers and network..."
    docker stop $BACKEND_CONTAINER $FRONTEND_CONTAINER 2>/dev/null || true
    docker rm $BACKEND_CONTAINER $FRONTEND_CONTAINER 2>/dev/null || true
    docker network rm $NETWORK_NAME 2>/dev/null || true
}

# Trap cleanup on exit
trap cleanup EXIT

# Initialize results file
echo "Docker Containerization Validation Results" > "$RESULTS_FILE"
echo "Date: $(date)" >> "$RESULTS_FILE"
echo "========================================" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# Phase 1: Build Testing
echo -e "${BLUE}Phase 1: Build Testing${NC}"
echo ""

info "Building backend container..."
START_TIME=$(date +%s)
if docker build -t $BACKEND_IMAGE backend/; then
    END_TIME=$(date +%s)
    BUILD_TIME=$((END_TIME - START_TIME))
    success "Backend container built successfully in ${BUILD_TIME}s"

    if [ $BUILD_TIME -lt 300 ]; then
        success "Backend build time < 5 minutes (${BUILD_TIME}s)"
    else
        error "Backend build time > 5 minutes (${BUILD_TIME}s)"
    fi
else
    error "Backend container build failed"
    exit 1
fi

echo ""
info "Building frontend container..."
START_TIME=$(date +%s)
if docker build -t $FRONTEND_IMAGE frontend/; then
    END_TIME=$(date +%s)
    BUILD_TIME=$((END_TIME - START_TIME))
    success "Frontend container built successfully in ${BUILD_TIME}s"

    if [ $BUILD_TIME -lt 300 ]; then
        success "Frontend build time < 5 minutes (${BUILD_TIME}s)"
    else
        error "Frontend build time > 5 minutes (${BUILD_TIME}s)"
    fi
else
    error "Frontend container build failed"
    exit 1
fi

# Phase 2: Image Size Testing
echo ""
echo -e "${BLUE}Phase 2: Image Size Testing${NC}"
echo ""

BACKEND_SIZE=$(docker images $BACKEND_IMAGE --format "{{.Size}}")
info "Backend image size: $BACKEND_SIZE"
echo "Backend image size: $BACKEND_SIZE" >> "$RESULTS_FILE"

FRONTEND_SIZE=$(docker images $FRONTEND_IMAGE --format "{{.Size}}")
info "Frontend image size: $FRONTEND_SIZE"
echo "Frontend image size: $FRONTEND_SIZE" >> "$RESULTS_FILE"

# Note: Size comparison is approximate due to different units
info "Check if sizes meet criteria (Backend < 300MB, Frontend < 200MB)"

# Phase 3: Container Run Testing
echo ""
echo -e "${BLUE}Phase 3: Container Run Testing${NC}"
echo ""

# Create test network
info "Creating test network..."
docker network create $NETWORK_NAME
success "Test network created"

# Run backend container
info "Starting backend container..."
docker run -d \
    --name $BACKEND_CONTAINER \
    --network $NETWORK_NAME \
    -p 8000:8000 \
    -e DATABASE_URL="$DATABASE_URL" \
    -e BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET" \
    -e CORS_ORIGINS="http://localhost:3000" \
    $BACKEND_IMAGE

# Wait for backend to start
info "Waiting for backend to start..."
sleep 10

# Check if backend is running
if docker ps | grep -q $BACKEND_CONTAINER; then
    success "Backend container is running"
else
    error "Backend container failed to start"
    docker logs $BACKEND_CONTAINER
    exit 1
fi

# Test backend health endpoint
info "Testing backend health endpoint..."
START_TIME=$(date +%s)
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    END_TIME=$(date +%s)
    RESPONSE_TIME=$((END_TIME - START_TIME))
    success "Backend health endpoint responding (${RESPONSE_TIME}s)"

    if [ $RESPONSE_TIME -lt 1 ]; then
        success "Backend health check response time < 1 second"
    else
        error "Backend health check response time > 1 second"
    fi
else
    error "Backend health endpoint not responding"
fi

# Run frontend container
echo ""
info "Starting frontend container..."
docker run -d \
    --name $FRONTEND_CONTAINER \
    --network $NETWORK_NAME \
    -p 3000:3000 \
    -e NEXT_PUBLIC_API_URL="http://$BACKEND_CONTAINER:8000" \
    -e BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET" \
    -e BETTER_AUTH_URL="http://localhost:3000" \
    $FRONTEND_IMAGE

# Wait for frontend to start
info "Waiting for frontend to start..."
sleep 10

# Check if frontend is running
if docker ps | grep -q $FRONTEND_CONTAINER; then
    success "Frontend container is running"
else
    error "Frontend container failed to start"
    docker logs $FRONTEND_CONTAINER
    exit 1
fi

# Test frontend health endpoint
info "Testing frontend health endpoint..."
START_TIME=$(date +%s)
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    END_TIME=$(date +%s)
    RESPONSE_TIME=$((END_TIME - START_TIME))
    success "Frontend health endpoint responding (${RESPONSE_TIME}s)"

    if [ $RESPONSE_TIME -lt 1 ]; then
        success "Frontend health check response time < 1 second"
    else
        error "Frontend health check response time > 1 second"
    fi
else
    error "Frontend health endpoint not responding"
fi

# Phase 4: Integration Testing
echo ""
echo -e "${BLUE}Phase 4: Integration Testing${NC}"
echo ""

# Test frontend can reach backend
info "Testing frontend-to-backend communication..."
if docker exec $FRONTEND_CONTAINER wget -qO- http://$BACKEND_CONTAINER:8000/health > /dev/null 2>&1; then
    success "Frontend can communicate with backend"
else
    error "Frontend cannot communicate with backend"
fi

# Phase 5: Security Testing
echo ""
echo -e "${BLUE}Phase 5: Security Testing${NC}"
echo ""

# Check backend runs as non-root
info "Checking backend user..."
BACKEND_USER=$(docker exec $BACKEND_CONTAINER whoami)
if [ "$BACKEND_USER" = "appuser" ]; then
    success "Backend runs as non-root user (appuser)"
else
    error "Backend runs as root or wrong user ($BACKEND_USER)"
fi

# Check frontend runs as non-root
info "Checking frontend user..."
FRONTEND_USER=$(docker exec $FRONTEND_CONTAINER whoami)
if [ "$FRONTEND_USER" = "node" ]; then
    success "Frontend runs as non-root user (node)"
else
    error "Frontend runs as root or wrong user ($FRONTEND_USER)"
fi

# Check for .env files in images
info "Checking for .env files in backend image..."
if docker run --rm $BACKEND_IMAGE find /app -name ".env*" 2>/dev/null | grep -q ".env"; then
    error "Found .env files in backend image"
else
    success "No .env files in backend image"
fi

info "Checking for .env files in frontend image..."
if docker run --rm $FRONTEND_IMAGE find /app -name ".env*" 2>/dev/null | grep -q ".env"; then
    error "Found .env files in frontend image"
else
    success "No .env files in frontend image"
fi

# Phase 6: Graceful Shutdown Testing
echo ""
echo -e "${BLUE}Phase 6: Graceful Shutdown Testing${NC}"
echo ""

info "Testing backend graceful shutdown..."
START_TIME=$(date +%s)
docker stop $BACKEND_CONTAINER
END_TIME=$(date +%s)
SHUTDOWN_TIME=$((END_TIME - START_TIME))
if [ $SHUTDOWN_TIME -lt 10 ]; then
    success "Backend shuts down gracefully in ${SHUTDOWN_TIME}s"
else
    error "Backend shutdown took too long (${SHUTDOWN_TIME}s)"
fi

info "Testing frontend graceful shutdown..."
START_TIME=$(date +%s)
docker stop $FRONTEND_CONTAINER
END_TIME=$(date +%s)
SHUTDOWN_TIME=$((END_TIME - START_TIME))
if [ $SHUTDOWN_TIME -lt 10 ]; then
    success "Frontend shuts down gracefully in ${SHUTDOWN_TIME}s"
else
    error "Frontend shutdown took too long (${SHUTDOWN_TIME}s)"
fi

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Validation Complete${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Results saved to: $RESULTS_FILE${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the results file for any failures"
echo "2. Test the application manually at http://localhost:3000"
echo "3. Run vulnerability scans: docker scout cves $BACKEND_IMAGE"
echo "4. Update tasks.md to mark completed tasks"
echo ""
