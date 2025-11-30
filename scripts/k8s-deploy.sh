#!/bin/bash
# Kubernetes deployment script for MG-Test (Docker Desktop)
# Usage: ./scripts/k8s-deploy.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Step 1: Build Docker images
echo "📦 Building Docker images..."

cd "$PROJECT_ROOT"
docker build -f apps/back-end/Dockerfile -t mg-test-api:latest .
docker build -f apps/socket-gateway/Dockerfile -t mg-test-socket:latest .
docker build -f apps/web-app/Dockerfile \
  --build-arg NEXT_PUBLIC_BACKEND_URL=http://localhost:30002 \
  --build-arg NEXT_PUBLIC_SOKCET_GETWAY_URL=http://localhost:30003 \
  -t mg-test-web:latest .

echo "✅ Images built successfully"

# Step 2: Apply Kubernetes manifests
echo ""
echo "☸️  Applying Kubernetes manifests..."
kubectl apply -k "$PROJECT_ROOT/k8s/"

# Step 3: Wait for deployments
echo ""
echo "⏳ Waiting for deployments to be ready..."
kubectl -n mg-test wait --for=condition=available --timeout=120s deployment/api || true
kubectl -n mg-test wait --for=condition=available --timeout=120s deployment/socket || true
kubectl -n mg-test wait --for=condition=available --timeout=180s deployment/web || true

echo ""
echo "✅ Deployment complete!"