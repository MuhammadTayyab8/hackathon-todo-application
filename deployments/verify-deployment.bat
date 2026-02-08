@echo off
REM verify-deployment.bat
REM Verification script for Todo App Docker Desktop Kubernetes deployment
REM Feature: 001-minikube-deployment (adapted for Docker Desktop)

setlocal enabledelayedexpansion

echo ==========================================
echo Deployment Verification
echo ==========================================
echo.

set FAILED=0

REM Check 1: Verify namespace exists
echo Check 1: Namespace verification...
kubectl get namespace todo-app >nul 2>&1
if %errorlevel% equ 0 (
    echo [32m✓ Namespace todo-app exists[0m
) else (
    echo [31m✗ Namespace todo-app does not exist[0m
    set FAILED=1
)
echo.

REM Check 2: Verify Helm release
echo Check 2: Helm release verification...
helm list -n todo-app | findstr "todo-chatbot.*deployed" >nul 2>&1
if %errorlevel% equ 0 (
    echo [32m✓ Helm release deployed[0m
) else (
    echo [31m✗ Helm release not deployed[0m
    set FAILED=1
)
echo.

REM Check 3: Verify pod count and status
echo Check 3: Pod verification...
for /f %%i in ('kubectl get pods -n todo-app --no-headers 2^>nul ^| find /c /v ""') do set POD_COUNT=%%i
if "!POD_COUNT!"=="4" (
    echo [32m✓ Expected 4 pods, found !POD_COUNT![0m
) else (
    echo [31m✗ Expected 4 pods, found !POD_COUNT![0m
    set FAILED=1
)

for /f %%i in ('kubectl get pods -n todo-app --no-headers 2^>nul ^| findstr "Running" ^| find /c /v ""') do set RUNNING_COUNT=%%i
if "!RUNNING_COUNT!"=="4" (
    echo [32m✓ All 4 pods are Running[0m
) else (
    echo [31m✗ Expected 4 Running pods, found !RUNNING_COUNT![0m
    set FAILED=1
)

for /f %%i in ('kubectl get pods -n todo-app --no-headers 2^>nul ^| findstr "1/1" ^| find /c /v ""') do set READY_COUNT=%%i
if "!READY_COUNT!"=="4" (
    echo [32m✓ All 4 pods are Ready (1/1)[0m
) else (
    echo [31m✗ Expected 4 Ready pods, found !READY_COUNT![0m
    set FAILED=1
)

kubectl get pods -n todo-app
echo.

REM Check 4: Verify frontend pods
echo Check 4: Frontend pod verification...
for /f %%i in ('kubectl get pods -n todo-app -l app=todo-frontend --no-headers 2^>nul ^| find /c /v ""') do set FRONTEND_COUNT=%%i
if "!FRONTEND_COUNT!"=="2" (
    echo [32m✓ Expected 2 frontend pods, found !FRONTEND_COUNT![0m
) else (
    echo [31m✗ Expected 2 frontend pods, found !FRONTEND_COUNT![0m
    set FAILED=1
)
echo.

REM Check 5: Verify backend pods
echo Check 5: Backend pod verification...
for /f %%i in ('kubectl get pods -n todo-app -l app=todo-backend --no-headers 2^>nul ^| find /c /v ""') do set BACKEND_COUNT=%%i
if "!BACKEND_COUNT!"=="2" (
    echo [32m✓ Expected 2 backend pods, found !BACKEND_COUNT![0m
) else (
    echo [31m✗ Expected 2 backend pods, found !BACKEND_COUNT![0m
    set FAILED=1
)
echo.

REM Check 6: Verify services
echo Check 6: Service verification...
kubectl get service frontend-service -n todo-app >nul 2>&1
if %errorlevel% equ 0 (
    echo [32m✓ Frontend service exists[0m
) else (
    echo [31m✗ Frontend service does not exist[0m
    set FAILED=1
)

kubectl get service backend-service -n todo-app >nul 2>&1
if %errorlevel% equ 0 (
    echo [32m✓ Backend service exists[0m
) else (
    echo [31m✗ Backend service does not exist[0m
    set FAILED=1
)

kubectl get services -n todo-app
echo.

REM Check 7: Verify deployments
echo Check 7: Deployment verification...
for /f %%i in ('kubectl get deployment todo-chatbot-frontend -n todo-app -o jsonpath^="{.status.readyReplicas}" 2^>nul') do set FRONTEND_READY=%%i
if "!FRONTEND_READY!"=="2" (
    echo [32m✓ Frontend deployment ready (2/2)[0m
) else (
    echo [31m✗ Frontend deployment not ready (expected 2, got !FRONTEND_READY!)[0m
    set FAILED=1
)

for /f %%i in ('kubectl get deployment todo-chatbot-backend -n todo-app -o jsonpath^="{.status.readyReplicas}" 2^>nul') do set BACKEND_READY=%%i
if "!BACKEND_READY!"=="2" (
    echo [32m✓ Backend deployment ready (2/2)[0m
) else (
    echo [31m✗ Backend deployment not ready (expected 2, got !BACKEND_READY!)[0m
    set FAILED=1
)

kubectl get deployments -n todo-app
echo.

REM Check 8: Verify ConfigMap
echo Check 8: ConfigMap verification...
kubectl get configmap todo-chatbot-config -n todo-app >nul 2>&1
if %errorlevel% equ 0 (
    echo [32m✓ ConfigMap exists[0m
) else (
    echo [31m✗ ConfigMap does not exist[0m
    set FAILED=1
)
echo.

REM Summary
echo ==========================================
echo Verification Summary
echo ==========================================
echo.

if !FAILED! equ 0 (
    echo [32m✅ All verification checks passed![0m
    echo.
    echo Deployment is healthy and ready for use.
    echo.
    echo Next steps:
    echo   1. Access frontend: kubectl port-forward -n todo-app service/frontend-service 3000:3000
    echo   2. Access backend: kubectl port-forward -n todo-app service/backend-service 8000:8000
    echo   3. Test application functionality in browser
    echo.
    exit /b 0
) else (
    echo [31m❌ Some verification checks failed![0m
    echo.
    echo Troubleshooting steps:
    echo   1. Check pod logs: kubectl logs -l app=todo-frontend -n todo-app
    echo   2. Check pod logs: kubectl logs -l app=todo-backend -n todo-app
    echo   3. Describe pods: kubectl describe pods -n todo-app
    echo   4. Check events: kubectl get events -n todo-app --sort-by='.lastTimestamp'
    echo.
    exit /b 1
)

endlocal
