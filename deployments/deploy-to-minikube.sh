#!/bin/bash
# deploy-to-minikube.sh
# Automated deployment script for Todo App to Minikube
# Feature: 001-minikube-deployment

set -e  # Exit on error

echo "=========================================="
echo "Todo App Minikube Deployment"
echo "=========================================="
echo ""

# Step 0: Verify prerequisites
echo "Step 0: Verifying prerequisites..."
command -v minikube >/dev/null 2>&1 || { echo "ERROR: Minikube not installed"; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "ERROR: kubectl not installed"; exit 1; }
command -v helm >/dev/null 2>&1 || { echo "ERROR: Helm not installed"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "ERROR: Docker not installed"; exit 1; }
echo "✓ All prerequisites installed"

# Verify Docker images exist
echo "Verifying Docker images..."
docker images | grep -q "todo-frontend.*latest" || { echo "ERROR: todo-frontend:latest not found. Build it first."; exit 1; }
docker images | grep -q "todo-backend.*latest" || { echo "ERROR: todo-backend:latest not found. Build it first."; exit 1; }
echo "✓ Docker images found"

# Verify Helm chart exists
if [ ! -d "todo-chatbot-chart" ]; then
    echo "ERROR: Helm chart not found at todo-chatbot-chart/"
    exit 1
fi
echo "✓ Helm chart found"
echo ""

# Step 1: Start Minikube
echo "Step 1: Starting Minikube cluster..."
if minikube status | grep -q "Running"; then
    echo "✓ Minikube already running"
else
    echo "Starting Minikube with 2 CPUs and 1800MB RAM (adjusted for system constraints)..."
    minikube start --cpus=2 --memory=1800 --driver=docker
    echo "✓ Minikube started successfully"
fi

# Verify Minikube status
minikube status
echo ""

# Step 2: Verify kubectl connectivity
echo "Step 2: Verifying kubectl connectivity..."
kubectl cluster-info
echo "✓ kubectl connected to cluster"
echo ""

# Step 3: Load Docker images into Minikube
echo "Step 3: Loading Docker images into Minikube..."
echo "Loading frontend image (this may take 2-5 minutes)..."
minikube image load todo-frontend:latest
echo "✓ Frontend image loaded"

echo "Loading backend image (this may take 2-5 minutes)..."
minikube image load todo-backend:latest
echo "✓ Backend image loaded"

# Verify images are loaded
echo "Verifying images in Minikube..."
minikube image ls | grep todo
echo ""

# Step 4: Create namespace
echo "Step 4: Creating todo-app namespace..."
if kubectl get namespace todo-app >/dev/null 2>&1; then
    echo "✓ Namespace todo-app already exists"
else
    kubectl create namespace todo-app
    echo "✓ Namespace created"
fi

kubectl get namespace todo-app
echo ""

# Step 5: Validate Helm chart
echo "Step 5: Validating Helm chart..."
helm lint todo-chatbot-chart/
echo "✓ Helm chart validation passed"
echo ""

# Step 6: Install Helm chart
echo "Step 6: Installing Helm chart..."
if helm list -n todo-app | grep -q "todo-chatbot"; then
    echo "Helm release already exists, upgrading..."
    helm upgrade todo-chatbot ./todo-chatbot-chart --namespace todo-app
    echo "✓ Helm release upgraded"
else
    helm install todo-chatbot ./todo-chatbot-chart --namespace todo-app
    echo "✓ Helm release installed"
fi

# Verify Helm release
helm list -n todo-app
echo ""

# Step 7: Wait for pods to be ready
echo "Step 7: Waiting for pods to be ready (timeout: 120s)..."
kubectl wait --for=condition=ready pod --all -n todo-app --timeout=120s
echo "✓ All pods are ready"
echo ""

# Step 8: Display deployment status
echo "Step 8: Deployment Status"
echo "=========================================="
echo ""
echo "Pods:"
kubectl get pods -n todo-app
echo ""
echo "Services:"
kubectl get services -n todo-app
echo ""
echo "Deployments:"
kubectl get deployments -n todo-app
echo ""
echo "ConfigMap:"
kubectl get configmap -n todo-app
echo ""

# Step 9: Display access instructions
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "To access the application, run these commands in separate terminals:"
echo ""
echo "  Frontend:"
echo "    kubectl port-forward -n todo-app service/frontend-service 3000:3000"
echo "    Then open: http://localhost:3000"
echo ""
echo "  Backend API:"
echo "    kubectl port-forward -n todo-app service/backend-service 8000:8000"
echo "    Then open: http://localhost:8000/docs"
echo ""
echo "To verify deployment health, run:"
echo "    ./verify-deployment.sh"
echo ""
echo "To view logs:"
echo "    kubectl logs -l app=todo-frontend -n todo-app"
echo "    kubectl logs -l app=todo-backend -n todo-app"
echo ""
echo "To cleanup:"
echo "    helm uninstall todo-chatbot -n todo-app"
echo "    kubectl delete namespace todo-app"
echo "    minikube stop"
echo ""
