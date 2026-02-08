# Verification Checklist

**Feature**: 001-minikube-deployment
**Date**: 2026-02-02
**Purpose**: Comprehensive checklist for verifying successful deployment

## Pre-Deployment Verification

### Prerequisites Check

- [ ] Minikube installed (version >= 1.30.0)
  ```bash
  minikube version
  ```

- [ ] kubectl installed (version >= 1.24.0)
  ```bash
  kubectl version --client
  ```

- [ ] Helm installed (version >= 3.0.0)
  ```bash
  helm version
  ```

- [ ] Docker Desktop running
  ```bash
  docker ps
  ```

- [ ] Docker images built
  ```bash
  docker images | grep todo-frontend
  docker images | grep todo-backend
  ```

- [ ] Helm chart exists and is valid
  ```bash
  helm lint todo-chatbot-chart/
  ```

---

## Deployment Verification

### Minikube Cluster

- [ ] Minikube started successfully
  ```bash
  minikube status
  # Expected: minikube: Running, kubelet: Running, apiserver: Running
  ```

- [ ] kubectl can connect to cluster
  ```bash
  kubectl cluster-info
  # Expected: Kubernetes control plane is running
  ```

- [ ] Cluster has sufficient resources
  ```bash
  kubectl top nodes
  # Expected: CPU and memory usage within limits
  ```

### Image Loading

- [ ] Frontend image loaded into Minikube
  ```bash
  minikube image ls | grep todo-frontend
  # Expected: docker.io/library/todo-frontend:latest
  ```

- [ ] Backend image loaded into Minikube
  ```bash
  minikube image ls | grep todo-backend
  # Expected: docker.io/library/todo-backend:latest
  ```

### Namespace

- [ ] Namespace created
  ```bash
  kubectl get namespace todo-app
  # Expected: STATUS: Active
  ```

### Helm Release

- [ ] Helm chart installed successfully
  ```bash
  helm list -n todo-app
  # Expected: STATUS: deployed
  ```

- [ ] Helm release status is healthy
  ```bash
  helm status todo-chatbot -n todo-app
  # Expected: STATUS: deployed, all resources listed
  ```

---

## Resource Verification

### Pods

- [ ] All 4 pods exist
  ```bash
  kubectl get pods -n todo-app
  # Expected: 4 pods total
  ```

- [ ] All pods are Running
  ```bash
  kubectl get pods -n todo-app --field-selector=status.phase=Running
  # Expected: 4 pods
  ```

- [ ] All pods are Ready (1/1)
  ```bash
  kubectl get pods -n todo-app -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.containerStatuses[0].ready}{"\n"}{end}'
  # Expected: All show "true"
  ```

- [ ] Frontend pods exist (2 replicas)
  ```bash
  kubectl get pods -n todo-app -l app=todo-frontend
  # Expected: 2 pods
  ```

- [ ] Backend pods exist (2 replicas)
  ```bash
  kubectl get pods -n todo-app -l app=todo-backend
  # Expected: 2 pods
  ```

- [ ] No pods in error state
  ```bash
  kubectl get pods -n todo-app --field-selector=status.phase!=Running
  # Expected: No resources found
  ```

- [ ] Pod restart count is 0
  ```bash
  kubectl get pods -n todo-app -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.containerStatuses[0].restartCount}{"\n"}{end}'
  # Expected: All show "0"
  ```

### Services

- [ ] Frontend service exists
  ```bash
  kubectl get service frontend-service -n todo-app
  # Expected: TYPE: ClusterIP, PORT: 3000
  ```

- [ ] Backend service exists
  ```bash
  kubectl get service backend-service -n todo-app
  # Expected: TYPE: ClusterIP, PORT: 8000
  ```

- [ ] Frontend service has 2 endpoints
  ```bash
  kubectl get endpoints frontend-service -n todo-app -o jsonpath='{.subsets[0].addresses[*].ip}' | wc -w
  # Expected: 2
  ```

- [ ] Backend service has 2 endpoints
  ```bash
  kubectl get endpoints backend-service -n todo-app -o jsonpath='{.subsets[0].addresses[*].ip}' | wc -w
  # Expected: 2
  ```

### Deployments

- [ ] Frontend deployment exists
  ```bash
  kubectl get deployment todo-chatbot-frontend -n todo-app
  # Expected: READY: 2/2, AVAILABLE: 2
  ```

- [ ] Backend deployment exists
  ```bash
  kubectl get deployment todo-chatbot-backend -n todo-app
  # Expected: READY: 2/2, AVAILABLE: 2
  ```

- [ ] Frontend deployment is Available
  ```bash
  kubectl get deployment todo-chatbot-frontend -n todo-app -o jsonpath='{.status.conditions[?(@.type=="Available")].status}'
  # Expected: True
  ```

- [ ] Backend deployment is Available
  ```bash
  kubectl get deployment todo-chatbot-backend -n todo-app -o jsonpath='{.status.conditions[?(@.type=="Available")].status}'
  # Expected: True
  ```

### ConfigMap

- [ ] ConfigMap exists
  ```bash
  kubectl get configmap -n todo-app
  # Expected: todo-chatbot-config
  ```

- [ ] ConfigMap has correct data
  ```bash
  kubectl get configmap todo-chatbot-config -n todo-app -o yaml
  # Expected: NEXT_PUBLIC_API_URL and CORS_ORIGINS keys
  ```

---

## Health Verification

### Pod Health Checks

- [ ] All pods pass readiness probes
  ```bash
  kubectl get pods -n todo-app -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.conditions[?(@.type=="Ready")].status}{"\n"}{end}'
  # Expected: All show "True"
  ```

- [ ] All pods pass liveness probes (no restarts)
  ```bash
  kubectl get pods -n todo-app -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.containerStatuses[0].restartCount}{"\n"}{end}'
  # Expected: All show "0"
  ```

### Application Health Endpoints

- [ ] Backend health endpoint responds
  ```bash
  kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -n todo-app -- curl -s http://backend-service:8000/health
  # Expected: {"status":"healthy",...}
  ```

- [ ] Frontend health endpoint responds
  ```bash
  kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -n todo-app -- curl -s http://frontend-service:3000/health
  # Expected: Health status response
  ```

---

## Connectivity Verification

### Inter-Service Communication

- [ ] Frontend can reach backend
  ```bash
  FRONTEND_POD=$(kubectl get pods -n todo-app -l app=todo-frontend -o jsonpath='{.items[0].metadata.name}')
  kubectl exec -n todo-app $FRONTEND_POD -- curl -s http://backend-service:8000/health
  # Expected: 200 OK response
  ```

- [ ] Backend service DNS resolves
  ```bash
  kubectl run dns-test --image=busybox --rm -it --restart=Never -n todo-app -- nslookup backend-service
  # Expected: DNS resolution successful
  ```

- [ ] Frontend service DNS resolves
  ```bash
  kubectl run dns-test --image=busybox --rm -it --restart=Never -n todo-app -- nslookup frontend-service
  # Expected: DNS resolution successful
  ```

### External Access

- [ ] Frontend accessible via port-forward
  ```bash
  # In separate terminal: kubectl port-forward -n todo-app service/frontend-service 3000:3000
  curl http://localhost:3000/health
  # Expected: Health status response
  ```

- [ ] Backend accessible via port-forward
  ```bash
  # In separate terminal: kubectl port-forward -n todo-app service/backend-service 8000:8000
  curl http://localhost:8000/health
  # Expected: {"status":"healthy",...}
  ```

---

## Log Verification

### Pod Logs

- [ ] Frontend pods have no errors
  ```bash
  kubectl logs -l app=todo-frontend -n todo-app --tail=50
  # Expected: No error messages, application started successfully
  ```

- [ ] Backend pods have no errors
  ```bash
  kubectl logs -l app=todo-backend -n todo-app --tail=50
  # Expected: No error messages, application started successfully
  ```

### Events

- [ ] No warning or error events
  ```bash
  kubectl get events -n todo-app --field-selector type!=Normal
  # Expected: No resources found (or only informational events)
  ```

---

## Functional Verification

### Application Testing

- [ ] Frontend loads in browser
  - Open http://localhost:3000 (with port-forward active)
  - Expected: Application UI loads without errors

- [ ] Backend API documentation accessible
  - Open http://localhost:8000/docs (with port-forward active)
  - Expected: FastAPI Swagger UI loads

- [ ] Can create todo item
  - Use frontend UI to create a new todo
  - Expected: Todo appears in list

- [ ] Can read todo items
  - Refresh page or navigate to todo list
  - Expected: Previously created todos are visible

- [ ] Can update todo item
  - Edit an existing todo
  - Expected: Changes are saved and reflected

- [ ] Can delete todo item
  - Delete a todo from the list
  - Expected: Todo is removed

- [ ] Data persists across page refresh
  - Refresh browser page
  - Expected: Todos remain visible

---

## Performance Verification

### Deployment Time

- [ ] Minikube started in < 2 minutes
- [ ] Images loaded in < 5 minutes total
- [ ] Helm chart installed in < 30 seconds
- [ ] All pods ready in < 2 minutes
- [ ] Total deployment time < 10 minutes

### Response Time

- [ ] Health endpoints respond in < 1 second
- [ ] Frontend loads in < 5 seconds
- [ ] Todo operations complete in < 2 seconds

---

## Documentation Verification

### Artifacts Captured

- [ ] kubectl get all output saved
  ```bash
  kubectl get all -n todo-app > deployment-output.txt
  ```

- [ ] Pod logs captured
  ```bash
  kubectl logs -l app=todo-frontend -n todo-app > frontend-logs.txt
  kubectl logs -l app=todo-backend -n todo-app > backend-logs.txt
  ```

- [ ] Helm status captured
  ```bash
  helm status todo-chatbot -n todo-app > helm-status.txt
  ```

- [ ] Screenshots taken
  - [ ] Frontend UI
  - [ ] Backend API docs
  - [ ] kubectl get pods output
  - [ ] kubectl get services output

---

## Cleanup Verification (Optional)

### Uninstall

- [ ] Helm release uninstalled successfully
  ```bash
  helm uninstall todo-chatbot -n todo-app
  # Expected: release "todo-chatbot" uninstalled
  ```

- [ ] Namespace deleted successfully
  ```bash
  kubectl delete namespace todo-app
  # Expected: namespace "todo-app" deleted
  ```

- [ ] All resources removed
  ```bash
  kubectl get all -n todo-app
  # Expected: No resources found or namespace not found
  ```

- [ ] Minikube stopped (optional)
  ```bash
  minikube stop
  # Expected: Successfully stopped
  ```

---

## Summary

**Total Checks**: 60+

**Critical Checks** (Must Pass):
- All pods Running and Ready
- All services have endpoints
- Health endpoints respond
- Inter-service connectivity works
- Application accessible externally

**Optional Checks**:
- Performance metrics
- Documentation artifacts
- Cleanup verification

---

**Checklist Status**: Ready for use during deployment verification
