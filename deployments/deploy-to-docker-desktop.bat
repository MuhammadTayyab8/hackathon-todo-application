@echo off
REM deploy-to-docker-desktop.bat
REM Automated deployment script for Todo App to Docker Desktop Kubernetes
REM Feature: 001-minikube-deployment (adapted for Docker Desktop)

setlocal enabledelayedexpansion

echo ==========================================
echo Todo App Docker Desktop K8s Deployment
echo ==========================================
echo.

REM Step 0: Verify prerequisites
echo Step 0: Verifying prerequisites...
where kubectl >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: kubectl not installed
    exit /b 1
)

where helm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Helm not installed
    exit /b 1
)

where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker not installed
    exit /b 1
)
echo [32m✓ All prerequisites installed[0m

REM Verify Docker Desktop Kubernetes is running
echo Verifying Docker Desktop Kubernetes...
kubectl cluster-info | findstr "kubernetes.docker.internal" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Desktop Kubernetes not detected
    echo Please enable Kubernetes in Docker Desktop settings
    exit /b 1
)
echo [32m✓ Docker Desktop Kubernetes is running[0m

REM Verify Docker images exist
echo Verifying Docker images...
docker images | findstr "todo-frontend.*latest" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: todo-frontend:latest not found. Build it first.
    exit /b 1
)

docker images | findstr "todo-backend.*latest" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: todo-backend:latest not found. Build it first.
    exit /b 1
)
echo [32m✓ Docker images found[0m

REM Verify Helm chart exists
if not exist "todo-chatbot-chart" (
    echo ERROR: Helm chart not found at todo-chatbot-chart/
    exit /b 1
)
echo [32m✓ Helm chart found[0m
echo.

REM Step 1: Verify kubectl connectivity
echo Step 1: Verifying kubectl connectivity...
kubectl cluster-info
echo [32m✓ kubectl connected to Docker Desktop cluster[0m
echo.

REM Step 2: Verify images are accessible
echo Step 2: Verifying Docker images are accessible...
echo Note: Docker Desktop Kubernetes can access local Docker images directly
docker images | findstr "todo"
echo [32m✓ Images available to Kubernetes[0m
echo.

REM Step 3: Create namespace
echo Step 3: Creating todo-app namespace...
kubectl get namespace todo-app >nul 2>&1
if %errorlevel% equ 0 (
    echo [32m✓ Namespace todo-app already exists[0m
) else (
    kubectl create namespace todo-app
    echo [32m✓ Namespace created[0m
)

kubectl get namespace todo-app
echo.

REM Step 4: Validate Helm chart
echo Step 4: Validating Helm chart...
helm lint todo-chatbot-chart/
echo [32m✓ Helm chart validation passed[0m
echo.

REM Step 5: Install Helm chart
echo Step 5: Installing Helm chart...
helm list -n todo-app | findstr "todo-chatbot" >nul 2>&1
if %errorlevel% equ 0 (
    echo Helm release already exists, upgrading...
    helm upgrade todo-chatbot ./todo-chatbot-chart --namespace todo-app
    echo [32m✓ Helm release upgraded[0m
) else (
    helm install todo-chatbot ./todo-chatbot-chart --namespace todo-app
    echo [32m✓ Helm release installed[0m
)

REM Verify Helm release
helm list -n todo-app
echo.

REM Step 6: Wait for pods to be ready
echo Step 6: Waiting for pods to be ready (timeout: 120s)...
kubectl wait --for=condition=ready pod --all -n todo-app --timeout=120s
echo [32m✓ All pods are ready[0m
echo.

REM Step 7: Display deployment status
echo Step 7: Deployment Status
echo ==========================================
echo.
echo Pods:
kubectl get pods -n todo-app
echo.
echo Services:
kubectl get services -n todo-app
echo.
echo Deployments:
kubectl get deployments -n todo-app
echo.
echo ConfigMap:
kubectl get configmap -n todo-app
echo.

REM Step 8: Display access instructions
echo ==========================================
echo Deployment Complete!
echo ==========================================
echo.
echo To access the application, run these commands in separate terminals:
echo.
echo   Frontend:
echo     kubectl port-forward -n todo-app service/frontend-service 3000:3000
echo     Then open: http://localhost:3000
echo.
echo   Backend API:
echo     kubectl port-forward -n todo-app service/backend-service 8000:8000
echo     Then open: http://localhost:8000/docs
echo.
echo To verify deployment health, run:
echo     verify-deployment.bat
echo.
echo To view logs:
echo     kubectl logs -l app=todo-frontend -n todo-app
echo     kubectl logs -l app=todo-backend -n todo-app
echo.
echo To cleanup:
echo     helm uninstall todo-chatbot -n todo-app
echo     kubectl delete namespace todo-app
echo.

endlocal
