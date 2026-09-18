# ChiefPilot TZI - Kubernetes Deployment

## Quick Start

### Prerequisites
- Kubernetes cluster (GKE, EKS, AKS, or minikube)
- kubectl configured
- Helm (optional)
- Docker registry access

### 1. Build and Push Docker Image

```bash
# Build the Docker image
docker build -t ghcr.io/your-org/your-repo/chiefpilot-tzi:latest -f Dockerfile .

# Push to registry
docker push ghcr.io/your-org/your-repo/chiefpilot-tzi:latest
```

### 2. Create Secrets

```bash
# Option 1: Using the example template
kubectl apply -f k8s/secrets.example.yml

# Option 2: Create from command line
kubectl create secret generic chiefpilot-secrets \
  --from-literal=gemini-api-key='YOUR_GEMINI_API_KEY'
```

### 3. Update Deployment Image

Edit `k8s/deployment.yml` and update the image field:
```yaml
image: ghcr.io/your-org/your-repo/chiefpilot-tzi:sha-<commit-hash>
```

Or use kubectl to patch:
```bash
kubectl set image deployment/chiefpilot-tzi chiefpilot-tzi=ghcr.io/your-org/your-repo/chiefpilot-tzi:latest
```

### 4. Deploy to Cluster

```bash
# Apply all Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get deployment chiefpilot-tzi

# Check pods
kubectl get pods -l app=chiefpilot-tzi

# Check services
kubectl get svc chiefpilot-tzi

# Check ingress
kubectl get ingress chiefpilot-tzi-ingress
```

### 5. Access the Application

If using the Ingress configuration:
```bash
# Get the external IP (for LoadBalancer services)
kubectl get svc chiefpilot-tzi -w

# Or check ingress
kubectl get ingress chiefpilot-tzi-ingress
```

## Development Deployment

For local development with minikube:

```bash
# Start minikube
minikube start --memory=4096 --cpus=2

# Enable ingress
minikube addons enable ingress

# Build image with minikube docker
minikube image build -t chiefpilot-tzi:dev -f Dockerfile .

# Deploy
kubectl apply -f k8s/

# Access via minikube IP
minikube ip
```

## Scaling

### Manual Scaling
```bash
# Scale to 3 replicas
kubectl scale deployment chiefpilot-tzi --replicas=3
```

### Autoscaling
The HPA (Horizontal Pod Autoscaler) is already configured in `k8s/deployment.yml`.
It will automatically scale between 2-5 replicas based on CPU and memory usage.

## Monitoring

### View Logs
```bash
kubectl logs -l app=chiefpilot-tzi --tail=100 -f
```

### Exec into Pod
```bash
kubectl exec -it deployment/chiefpilot-tzi -- sh
```

## Cleanup

```bash
# Delete all resources
kubectl delete -f k8s/

# Delete secrets (be careful!)
kubectl delete secret chiefpilot-secrets
```

## Helm Chart (Optional)

For Helm deployment, create a `k8s/Chart.yaml` and `k8s/values.yaml` following Helm conventions.
