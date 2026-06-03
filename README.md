# Node.js on Kubernetes (k3s) — AWS Free Tier + CI/CD

> **Course Project · DevOps S2026** | Due: June 1, 2026

A Node.js Express app displaying visitor counter, container ID, and live timestamp — containerized with Docker, stored in Amazon ECR, deployed to **k3s** on a single EC2 t2.micro, and continuously delivered via GitHub Actions.

---

## Repository Structure

```
.
├── app/
│   ├── server.js                    # Express application
│   └── package.json
├── k8s/
│   ├── deployment.yaml              # Kubernetes Deployment
│   └── service.yaml                 # LoadBalancer Service (k3s Klipper)
├── .github/
│   └── workflows/
│       └── ci-cd.yml                # GitHub Actions CI/CD pipeline
├── Dockerfile                       # Multi-stage Docker build
├── ec2-setup.sh                     # One-time EC2 bootstrap (k3s)
└── README.md
```

---

## Why k3s?

| Feature | Minikube | k3s |
|---------|----------|-----|
| Memory usage | ~900 MB | ~200 MB |
| Install | Needs VM driver | Single curl command |
| Production-grade | No | Yes |
| LoadBalancer support | Manual tunnel | Built-in (Klipper) |
| Ideal for t2.micro | Tight | Comfortable |

---

## Prerequisites (Your Laptop)

| Tool | Download |
|------|----------|
| Node.js >= 18 | https://nodejs.org |
| Docker Desktop | https://docker.com/products/docker-desktop |
| AWS CLI | https://aws.amazon.com/cli |
| Git | https://git-scm.com |
| AWS Free Tier Account | https://aws.amazon.com/free |
| GitHub Account | https://github.com |

---

## Step-by-Step Guide

### Phase 1 — Test the App Locally

```bash
cd app
npm install
node server.js
# Open http://localhost:3000
```

### Phase 2 — Create ECR Repository

```bash
aws configure
aws ecr create-repository --repository-name nodejs-k8s-app --region us-east-1
```

### Phase 3 — Build & Push Docker Image

```bash
aws ecr get-login-password --region us-east-1 \
  | docker login --username AWS --password-stdin \
    <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

docker build -t nodejs-k8s-app .
docker tag nodejs-k8s-app:latest \
  <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/nodejs-k8s-app:latest
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/nodejs-k8s-app:latest
```

### Phase 4 — Launch EC2 t2.micro

- AMI: Ubuntu Server 22.04 LTS
- Instance type: t2.micro
- Security Group inbound: SSH (22) + HTTP (80)

### Phase 5 — Set Up EC2 with k3s

```bash
scp -i your-key.pem ec2-setup.sh ubuntu@<EC2_IP>:~/
ssh -i your-key.pem ubuntu@<EC2_IP>
chmod +x ec2-setup.sh && ./ec2-setup.sh
# Log out and back in after completion
kubectl get nodes   # Should show Ready
```

### Phase 6 — Authenticate EC2 to ECR

```bash
aws configure

kubectl create secret docker-registry ecr-registry-secret \
  --docker-server=<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com \
  --docker-username=AWS \
  --docker-password=$(aws ecr get-login-password --region us-east-1)

mkdir -p ~/k8s
# From your laptop: (edit deployment.yaml placeholders first)
scp -i your-key.pem k8s/*.yaml ubuntu@<EC2_IP>:~/k8s/
```

### Phase 7 — Deploy to k3s

```bash
kubectl apply -f ~/k8s/deployment.yaml
kubectl apply -f ~/k8s/service.yaml
kubectl get pods -w       # Wait for Running
kubectl get services      # Note EXTERNAL-IP
# Open: http://<EC2_PUBLIC_IP>
```

### Phase 8 — GitHub Actions CI/CD

Add these 6 secrets in **GitHub Repo → Settings → Secrets → Actions**:

| Secret | Value |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `AWS_REGION` | e.g. us-east-1 |
| `AWS_ACCOUNT_ID` | 12-digit AWS account ID |
| `EC2_HOST` | EC2 public IP |
| `EC2_SSH_PRIVATE_KEY` | Contents of .pem file |

Then push any change to main branch — pipeline triggers automatically.

### Phase 9 — Verify & Test

```bash
kubectl get pods
kubectl get services
curl http://localhost/health

# Scale
kubectl scale deployment nodejs-app --replicas=2
kubectl get pods
kubectl scale deployment nodejs-app --replicas=1
```

### Phase 10 — Clean Up

```bash
kubectl delete -f ~/k8s/
sudo systemctl stop k3s
# Terminate EC2 in AWS Console
aws ecr delete-repository --repository-name nodejs-k8s-app --force --region us-east-1
```

---

## Cost Analysis

| Resource | Free Tier | Cost |
|----------|-----------|------|
| EC2 t2.micro | 750 hrs/month | $0 |
| ECR | 500 MB/month | $0 |
| k3s | Free tool | $0 |
| GitHub Actions | 2,000 min/month | $0 |
| **Total** | | **$0** |

---

## Endpoints

| URL | Description |
|-----|-------------|
| `http://<EC2_IP>/` | App: visitor counter, container ID, timestamp |
| `http://<EC2_IP>/health` | JSON health check |
