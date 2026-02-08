#!/bin/bash
# verify-deployment-docker-desktop.sh
# Verification script for Todo App Docker Desktop Kubernetes deployment
# Feature: 001-minikube-deployment (adapted for Docker Desktop)

set -e

echo "=========================================="
echo "Deployment Verification"
echo "=========================================="
echo ""

FAILED=0

# Function to print success/failure
check_result() {
    if [ $? -eq 0 ]; then
        echo "✓ $1"
    else
        echo "✗ $1"
        FAILED=1
    fi
}

# Check 1: Verify namespace exists
echo "Check 1: Namespace verification..."
kubectl get namespace todo-app >/dev/null 2>&1
check_result "Namespace todo-app exists"
echo ""

# Check 2: Verify Helm release
echo "Check 2: Helm release verification..."
helm list -n todo-app | grep -q "todo-chatbot.*deployed"
check_result "Helm release deployed"
echo ""

# Check 3: Verify pod count and status
echo "Check 3: Pod verification..."
POD_COUNT=$(kubectl get pods -n todo-app --no-headers 2>/dev/null | wc -l)
if [ "$POD_COUNT" -eq 4 ]; then
    echo "✓ Expected 4 pods, found $POD_COUNT"
else
    echo "✗ Expected 4 pods, found $POD_COUNT"
    FAILED=1
fi

RUNNING_COUNT=$(kubectl get pods -n todo-app --no-headers 2>/dev/null | grep "Running" | wc -l)
if [ "$RUNNING_COUNT" -eq 4 ]; then
    echo "✓ All 4 pods are Running"
else
    echo "✗ Expected 4 Running pods, found $RUNNING_COUNT"
    FAILED=1
fi

READY_COUNT=$(kubectl get pods -n todo-app --no-headers 2>/dev/null | grep "1/1" | wc -l)
if [ "$READY_COUNT" -eq 4 ]; then
    echo "✓ All 4 pods are Ready (1/1)"
else
    echo "✗ Expected 4 Ready pods, found $READY_COUNT"
    FAILED=1
fi

kubectl get pods -n todo-app
echo ""

# Check 4: Verify frontend pods
echo "Check 4: Frontend pod verification..."
FRONTEND_COUNT=$(kubectl get pods -n todo-app -l app=todo-frontend --no-headers 2>/dev/null | wc -l)
if [ "$FRONTEND_COUNT" -eq 2 ]; then
    echo "✓ Expected 2 frontend pods, found $FRONTEND_COUNT"
else
    echo "✗ Expected 2 frontend pods, found $FRONTEND_COUNT"
    FAILED=1
fi
echo ""

# Check 5: Verify backend pods
echo "Check 5: Backend pod verification..."
BACKEND_COUNT=$(kubectl get pods -n todo-app -l app=todo-backend --no-headers 2>/dev/null | wc -l)
if [ "$BACKEND_COUNT" -eq 2 ]; then
    echo "✓ Expected 2 backend pods, found $BACKEND_COUNT"
else
    echo "✗ Expected 2 backend pods, found $BACKEND_COUNT"
    FAILED=1
fi
echo ""

# Check 6: Verify services
echo "Check 6: Service verification..."
kubectl get service frontend-service -n todo-app >/dev/null 2>&1
check_result "Frontend service exists"

kubectl get service backend-service -n todo-app >/dev/null 2>&1
check_result "Backend service exists"

kubectl get services -n todo-app
echo ""

# Check 7: Verify service endpoints
echo "Check 7: Service endpoint verification..."
FRONTEND_ENDPOINTS=$(kubectl get endpoints frontend-service -n todo-app -o jsonpath='{.subsets[0].addresses}' 2>/dev/null | grep -o "ip" | wc -l)
if [ "$FRONTEND_ENDPOINTS" -eq 2 ]; then
    echo "✓ Frontend service has 2 endpoints"
else
    echo "✗ Expected 2 frontend endpoints, found $FRONTEND_ENDPOINTS"
    FAILED=1
fi

BACKEND_ENDPOINTS=$(kubectl get endpoints backend-service -n todo-app -o jsonpath='{.subsets[0].addresses}' 2>/dev/null | grep -o "ip" | wc -l)
if [ "$BACKEND_ENDPOINTS" -eq 2 ]; then
    echo "✓ Backend service has 2 endpoints"
else
    echo "✗ Expected 2 backend endpoints, found $BACKEND_ENDPOINTS"
    FAILED=1
fi
echo ""

# Check 8: Verify deployments
echo "Check 8: Deployment verification..."
FRONTEND_READY=$(kubectl get deployment todo-chatbot-frontend -n todo-app -o jsonpath='{.status.readyReplicas}' 2>/dev/null)
if [ "$FRONTEND_READY" = "2" ]; then
    echo "✓ Frontend deployment ready (2/2)"
else
    echo "✗ Frontend deployment not ready (expected 2, got $FRONTEND_READY)"
    FAILED=1
fi

BACKEND_READY=$(kubectl get deployment todo-chatbot-backend -n todo-app -o jsonpath='{.status.readyReplicas}' 2>/dev/null)
if [ "$BACKEND_READY" = "2" ]; then
    echo "✓ Backend deployment ready (2/2)"
else
    echo "✗ Backend deployment not ready (expected 2, got $BACKEND_READY)"
    FAILED=1
fi

kubectl get deployments -n todo-app
echo ""

# Check 9: Verify ConfigMap
echo "Check 9: ConfigMap verification..."
kubectl get configmap todo-chatbot-config -n todo-app >/dev/null 2>&1
check_result "ConfigMap exists"

CONFIG_KEYS=$(kubectl get configmap todo-chatbot-config -n todo-app -o jsonpath='{.data}' 2>/dev/null | grep -o "NEXT_PUBLIC_API_URL\|CORS_ORIGINS" | wc -l)
if [ "$CONFIG_KEYS" -ge 2 ]; then
    echo "✓ ConfigMap has required keys"
else
    echo "✗ ConfigMap missing required keys"
    FAILED=1
fi
echo ""

# Check 10: Verify no pod restarts
echo "Check 10: Pod restart verification..."
RESTART_COUNT=$(kubectl get pods -n todo-app -o jsonpath='{range .items[*]}{.status.containerStatuses[0].restartCount}{"\n"}{end}' 2>/dev/null | awk '{sum+=$1} END {print sum}')
if [ "$RESTART_COUNT" = "0" ] || [ -z "$RESTART_COUNT" ]; then
    echo "✓ No pod restarts detected"
else
    echo "⚠ Warning: $RESTART_COUNT pod restarts detected"
fi
echo ""

# Check 11: Verify readiness probes
echo "Check 11: Readiness probe verification..."
NOT_READY=$(kubectl get pods -n todo-app -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.conditions[?(@.type=="Ready")].status}{"\n"}{end}' 2>/dev/null | grep -c "False" || true)
if [ "$NOT_READY" -eq 0 ]; then
    echo "✓ All pods pass readiness probes"
else
    echo "✗ $NOT_READY pods failing readiness probes"
    FAILED=1
fi
echo ""

# Check 12: Test backend health endpoint
echo "Check 12: Backend health endpoint test..."
echo "Testing backend health endpoint from within cluster..."
if kubectl run curl-test --image=curlimages/curl --rm -i --restart=Never -n todo-app --timeout=30s -- curl -s http://backend-service:8000/health >/dev/null 2>&1; then
    echo "✓ Backend health endpoint responds"
else
    echo "✗ Backend health endpoint not responding"
    FAILED=1
fi
echo ""

# Check 13: Check for error events
echo "Check 13: Event verification..."
ERROR_EVENTS=$(kubectl get events -n todo-app --field-selector type!=Normal 2>/dev/null | grep -v "LAST SEEN" | wc -l)
if [ "$ERROR_EVENTS" -eq 0 ]; then
    echo "✓ No error events detected"
else
    echo "⚠ Warning: $ERROR_EVENTS non-normal events detected"
    kubectl get events -n todo-app --field-selector type!=Normal | head -10
fi
echo ""

# Summary
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo ""

if [ $FAILED -eq 0 ]; then
    echo "✅ All verification checks passed!"
    echo ""
    echo "Deployment is healthy and ready for use."
    echo ""
    echo "Next steps:"
    echo "  1. Access frontend: kubectl port-forward -n todo-app service/frontend-service 3000:3000"
    echo "  2. Access backend: kubectl port-forward -n todo-app service/backend-service 8000:8000"
    echo "  3. Test application functionality in browser"
    echo ""
    exit 0
else
    echo "❌ Some verification checks failed!"
    echo ""
    echo "Troubleshooting steps:"
    echo "  1. Check pod logs: kubectl logs -l app=todo-frontend -n todo-app"
    echo "  2. Check pod logs: kubectl logs -l app=todo-backend -n todo-app"
    echo "  3. Describe pods: kubectl describe pods -n todo-app"
    echo "  4. Check events: kubectl get events -n todo-app --sort-by='.lastTimestamp'"
    echo ""
    exit 1
fi
