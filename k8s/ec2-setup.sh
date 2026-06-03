#!/usr/bin/env bash
# ec2-setup.sh — One-time setup for EC2 t2.micro with k3s
set -euo pipefail

echo "===== [1/5] System update ====="
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl unzip

echo "===== [2/5] Install AWS CLI v2 ====="
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -q awscliv2.zip
sudo ./aws/install
rm -rf awscliv2.zip aws/
echo "AWS CLI: $(aws --version)"

echo "===== [3/5] Install k3s ====="
# k3s is a lightweight Kubernetes — single binary, no Docker daemon needed
# --write-kubeconfig-mode allows non-root kubectl access
curl -sfL https://get.k3s.io | sh -s - \
  --write-kubeconfig-mode 644 \
  --disable traefik          # disable built-in ingress; we use LoadBalancer service

# Wait for k3s to be ready
sleep 10
sudo systemctl status k3s --no-pager

echo "===== [4/5] Configure kubectl for ubuntu user ====="
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown ubuntu:ubuntu ~/.kube/config
sed -i 's/127.0.0.1/localhost/g' ~/.kube/config
export KUBECONFIG=~/.kube/config
echo 'export KUBECONFIG=~/.kube/config' >> ~/.bashrc

echo "===== [5/5] Install Docker (for building/pulling images) ====="
sudo apt-get install -y ca-certificates gnupg lsb-release
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io
sudo usermod -aG docker ubuntu

echo ""
echo "✅ EC2 k3s setup complete!"
echo ""
echo "   Verify with:"
echo "     kubectl get nodes"
echo "     kubectl get pods -A"
echo ""
echo "   NOTE: Log out and back in to activate docker group."
