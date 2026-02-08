# Docker Containerization Validation Script (PowerShell)
# This script automates the validation of Docker containers for the Todo application
# Run this script once Docker connectivity is restored

param(
    [string]$DatabaseUrl = $env:DATABASE_URL,
    [string]$BetterAuthSecret = "test-secret-key-min-32-chars-long-for-testing"
)

# Configuration
$BackendImage = "todo-backend:latest"
$FrontendImage = "todo-frontend:latest"
$BackendContainer = "todo-backend-test"
$FrontendContainer = "todo-frontend-test"
$NetworkName = "todo-test-network"
$ResultsFile = "validation-results.txt"

# Colors
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Cyan"

Write-Host "========================================" -ForegroundColor $Blue
Write-Host "Docker Containerization Validation" -ForegroundColor $Blue
Write-Host "========================================" -ForegroundColor $Blue
Write-Host ""

# Initialize results file
"Docker Containerization Validation Results" | Out-File -FilePath $ResultsFile
"Date: $(Get-Date)" | Out-File -FilePath $ResultsFile -Append
"========================================" | Out-File -FilePath $ResultsFile -Append
"" | Out-File -FilePath $ResultsFile -Append

# Function to print success
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $Green
    "✓ $Message" | Out-File -FilePath $ResultsFile -Append
}

# Function to print error
function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $Red
    "✗ $Message" | Out-File -FilePath $ResultsFile -Append
}

# Function to print info
function Write-Info {
    param([string]$Message)
    Write-Host "→ $Message" -ForegroundColor $Yellow
}

# Function to cleanup
function Cleanup {
    Write-Info "Cleaning up test containers and network..."
    docker stop $BackendContainer $FrontendContainer 2>$null
    docker rm $BackendContainer $FrontendContainer 2>$null
    docker network rm $NetworkName 2>$null
}

# Cleanup on exit
trap { Cleanup }

# Phase 1: Build Testing
Write-Host ""
Write-Host "Phase 1: Build Testing" -ForegroundColor $Blue
Write-Host ""

Write-Info "Building backend container..."
$StartTime = Get-Date
try {
    docker build -t $BackendImage backend/ 2>&1 | Out-Null
    $EndTime = Get-Date
    $BuildTime = ($EndTime - $StartTime).TotalSeconds
    Write-Success "Backend container built successfully in $([math]::Round($BuildTime, 2))s"

    if ($BuildTime -lt 300) {
        Write-Success "Backend build time < 5 minutes ($([math]::Round($BuildTime, 2))s)"
    } else {
        Write-Error-Custom "Backend build time > 5 minutes ($([math]::Round($BuildTime, 2))s)"
    }
} catch {
    Write-Error-Custom "Backend container build failed: $_"
    exit 1
}

Write-Host ""
Write-Info "Building frontend container..."
$StartTime = Get-Date
try {
    docker build -t $FrontendImage frontend/ 2>&1 | Out-Null
    $EndTime = Get-Date
    $BuildTime = ($EndTime - $StartTime).TotalSeconds
    Write-Success "Frontend container built successfully in $([math]::Round($BuildTime, 2))s"

    if ($BuildTime -lt 300) {
        Write-Success "Frontend build time < 5 minutes ($([math]::Round($BuildTime, 2))s)"
    } else {
        Write-Error-Custom "Frontend build time > 5 minutes ($([math]::Round($BuildTime, 2))s)"
    }
} catch {
    Write-Error-Custom "Frontend container build failed: $_"
    exit 1
}

# Phase 2: Image Size Testing
Write-Host ""
Write-Host "Phase 2: Image Size Testing" -ForegroundColor $Blue
Write-Host ""

$BackendSize = docker images $BackendImage --format "{{.Size}}"
Write-Info "Backend image size: $BackendSize"
"Backend image size: $BackendSize" | Out-File -FilePath $ResultsFile -Append

$FrontendSize = docker images $FrontendImage --format "{{.Size}}"
Write-Info "Frontend image size: $FrontendSize"
"Frontend image size: $FrontendSize" | Out-File -FilePath $ResultsFile -Append

Write-Info "Check if sizes meet criteria (Backend < 300MB, Frontend < 200MB)"

# Phase 3: Container Run Testing
Write-Host ""
Write-Host "Phase 3: Container Run Testing" -ForegroundColor $Blue
Write-Host ""

# Create test network
Write-Info "Creating test network..."
docker network create $NetworkName 2>$null
Write-Success "Test network created"

# Run backend container
Write-Info "Starting backend container..."
docker run -d `
    --name $BackendContainer `
    --network $NetworkName `
    -p 8000:8000 `
    -e DATABASE_URL="$DatabaseUrl" `
    -e BETTER_AUTH_SECRET="$BetterAuthSecret" `
    -e CORS_ORIGINS="http://localhost:3000" `
    $BackendImage 2>$null

# Wait for backend to start
Write-Info "Waiting for backend to start..."
Start-Sleep -Seconds 10

# Check if backend is running
$BackendRunning = docker ps | Select-String $BackendContainer
if ($BackendRunning) {
    Write-Success "Backend container is running"
} else {
    Write-Error-Custom "Backend container failed to start"
    docker logs $BackendContainer
    exit 1
}

# Test backend health endpoint
Write-Info "Testing backend health endpoint..."
$StartTime = Get-Date
try {
    $Response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5
    $EndTime = Get-Date
    $ResponseTime = ($EndTime - $StartTime).TotalSeconds

    if ($Response.StatusCode -eq 200) {
        Write-Success "Backend health endpoint responding ($([math]::Round($ResponseTime, 2))s)"

        if ($ResponseTime -lt 1) {
            Write-Success "Backend health check response time < 1 second"
        } else {
            Write-Error-Custom "Backend health check response time > 1 second"
        }
    }
} catch {
    Write-Error-Custom "Backend health endpoint not responding: $_"
}

# Run frontend container
Write-Host ""
Write-Info "Starting frontend container..."
docker run -d `
    --name $FrontendContainer `
    --network $NetworkName `
    -p 3000:3000 `
    -e NEXT_PUBLIC_API_URL="http://${BackendContainer}:8000" `
    -e BETTER_AUTH_SECRET="$BetterAuthSecret" `
    -e BETTER_AUTH_URL="http://localhost:3000" `
    $FrontendImage 2>$null

# Wait for frontend to start
Write-Info "Waiting for frontend to start..."
Start-Sleep -Seconds 10

# Check if frontend is running
$FrontendRunning = docker ps | Select-String $FrontendContainer
if ($FrontendRunning) {
    Write-Success "Frontend container is running"
} else {
    Write-Error-Custom "Frontend container failed to start"
    docker logs $FrontendContainer
    exit 1
}

# Test frontend health endpoint
Write-Info "Testing frontend health endpoint..."
$StartTime = Get-Date
try {
    $Response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
    $EndTime = Get-Date
    $ResponseTime = ($EndTime - $StartTime).TotalSeconds

    if ($Response.StatusCode -eq 200) {
        Write-Success "Frontend health endpoint responding ($([math]::Round($ResponseTime, 2))s)"

        if ($ResponseTime -lt 1) {
            Write-Success "Frontend health check response time < 1 second"
        } else {
            Write-Error-Custom "Frontend health check response time > 1 second"
        }
    }
} catch {
    Write-Error-Custom "Frontend health endpoint not responding: $_"
}

# Phase 4: Integration Testing
Write-Host ""
Write-Host "Phase 4: Integration Testing" -ForegroundColor $Blue
Write-Host ""

# Test frontend can reach backend
Write-Info "Testing frontend-to-backend communication..."
try {
    $Result = docker exec $FrontendContainer wget -qO- "http://${BackendContainer}:8000/health" 2>$null
    if ($Result) {
        Write-Success "Frontend can communicate with backend"
    } else {
        Write-Error-Custom "Frontend cannot communicate with backend"
    }
} catch {
    Write-Error-Custom "Frontend-to-backend communication test failed: $_"
}

# Phase 5: Security Testing
Write-Host ""
Write-Host "Phase 5: Security Testing" -ForegroundColor $Blue
Write-Host ""

# Check backend runs as non-root
Write-Info "Checking backend user..."
$BackendUser = docker exec $BackendContainer whoami 2>$null
if ($BackendUser -eq "appuser") {
    Write-Success "Backend runs as non-root user (appuser)"
} else {
    Write-Error-Custom "Backend runs as root or wrong user ($BackendUser)"
}

# Check frontend runs as non-root
Write-Info "Checking frontend user..."
$FrontendUser = docker exec $FrontendContainer whoami 2>$null
if ($FrontendUser -eq "node") {
    Write-Success "Frontend runs as non-root user (node)"
} else {
    Write-Error-Custom "Frontend runs as root or wrong user ($FrontendUser)"
}

# Check for .env files in images
Write-Info "Checking for .env files in backend image..."
$BackendEnvFiles = docker run --rm $BackendImage find /app -name ".env*" 2>$null
if ($BackendEnvFiles) {
    Write-Error-Custom "Found .env files in backend image"
} else {
    Write-Success "No .env files in backend image"
}

Write-Info "Checking for .env files in frontend image..."
$FrontendEnvFiles = docker run --rm $FrontendImage find /app -name ".env*" 2>$null
if ($FrontendEnvFiles) {
    Write-Error-Custom "Found .env files in frontend image"
} else {
    Write-Success "No .env files in frontend image"
}

# Phase 6: Graceful Shutdown Testing
Write-Host ""
Write-Host "Phase 6: Graceful Shutdown Testing" -ForegroundColor $Blue
Write-Host ""

Write-Info "Testing backend graceful shutdown..."
$StartTime = Get-Date
docker stop $BackendContainer 2>$null
$EndTime = Get-Date
$ShutdownTime = ($EndTime - $StartTime).TotalSeconds
if ($ShutdownTime -lt 10) {
    Write-Success "Backend shuts down gracefully in $([math]::Round($ShutdownTime, 2))s"
} else {
    Write-Error-Custom "Backend shutdown took too long ($([math]::Round($ShutdownTime, 2))s)"
}

Write-Info "Testing frontend graceful shutdown..."
$StartTime = Get-Date
docker stop $FrontendContainer 2>$null
$EndTime = Get-Date
$ShutdownTime = ($EndTime - $StartTime).TotalSeconds
if ($ShutdownTime -lt 10) {
    Write-Success "Frontend shuts down gracefully in $([math]::Round($ShutdownTime, 2))s"
} else {
    Write-Error-Custom "Frontend shutdown took too long ($([math]::Round($ShutdownTime, 2))s)"
}

# Cleanup
Cleanup

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor $Blue
Write-Host "Validation Complete" -ForegroundColor $Blue
Write-Host "========================================" -ForegroundColor $Blue
Write-Host ""
Write-Host "Results saved to: $ResultsFile" -ForegroundColor $Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor $Yellow
Write-Host "1. Review the results file for any failures"
Write-Host "2. Test the application manually at http://localhost:3000"
Write-Host "3. Run vulnerability scans: docker scout cves $BackendImage"
Write-Host "4. Update tasks.md to mark completed tasks"
Write-Host ""
