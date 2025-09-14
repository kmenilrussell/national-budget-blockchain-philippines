

# National Budget Blockchain (NBB) 🏛️

An auditable blockchain system for Philippine government budget transparency—making every peso traceable, immutable, and accessible in real time.

---

## 🌟 Vision & Background

### Why This Project Exists

Recent investigations revealed serious corruption in flood-control infrastructure spending in the Philippines:

- An audit found **₱545 billion (US\$9.6B)** allocated between 2022–2025 was marred by **substandard, undocumented, or non-existent projects**
- Only **15 contractors received 20%** of the budget
- Contractors testified to paying **25–30% kickbacks** to legislators and officials
- Public outrage prompted President Marcos to convene an **independent commission** for investigation and suspend bidding

These crises fueled public distrust and underscored the urgent need for systemic transparency.

---

## ⚡ Legislative Spark: The Blockchain the Budget Bill

- **Senate Bill No. 1330**—the "Blockchain the Budget Bill" by Sen. Bam Aquino—proposes a **National Budget Blockchain System**
- Every peso becomes a **Digital Public Asset (DPA)**
- Citizens, COA, and civil society can audit government spending in real time

If enacted, the system would be managed by DICT in coordination with DBM and COA, modernizing government transparency.

---

## 🚀 Project Overview

This MVP features:

- **Blockchain Core**: PoA consensus, SHA-256 hashing, Merkle roots
- **DPAs**: Budget allocation as transparent, immutable digital assets
- **Privacy Layer**: zkLedger-inspired zero-knowledge proofs for sensitive data
- **APIs (FastAPI)**: Access to blocks, accounts, DPAs, Merkle proofs, audit/FOI exports, and real-time metrics
- **Frontend**: Dashboard, exploration tools, department/transaction management, OTC trading, real-time updates, i18n (EN/PH), and accessibility (WCAG 2.0 AA)
- **Security & Compliance**: JWT + RBAC auth, Vault-managed secrets, TLS/mTLS, append-only audit logs anchored on-chain

---

## 👨‍💻 Author Credentials

Created by **Karl Russell Sumando Menil**, holder of a **Professional Certificate in Full Stack Development (MERN)** from **MIT xPRO / Emeritus**, secured on the blockchain:

- **Issued:** November 12, 2021
- **Blockchain Anchor:** December 20, 2021
- **Blockchain ID:** `714905`

This credential underscores verified expertise in software design and system architecture practices.

---

## 🛠️ Setup & Deployment Guide

### 📋 Prerequisites

Ensure you have the following installed on your system:

- **Node.js**: v18 or newer (LTS recommended) - [Download here](https://nodejs.org/)
- **Python**: v3.9 or newer - [Download here](https://www.python.org/downloads/)
- **Git** - [Download here](https://git-scm.com/downloads)
- **Docker & Docker Compose** (Optional, for containerized deployment) - [Download here](https://www.docker.com/products/docker-desktop/)

*For production deployment, you will also need:*
- **Kubernetes + kubectl**
- **Helm**
- **An Ingress Controller** (e.g., Nginx Ingress)
- **Prometheus, Grafana & Alertmanager** (for monitoring)

---

### 1. 🖥️ Local Development Setup

#### Clone the Repository
```bash
git clone <repository-url>
cd national-budget-blockchain-philippines-main
```

#### Back-End (Python Blockchain API) Setup

1.  **Create and activate a virtual environment** (recommended):
    ```bash
    # Linux/macOS
    python3 -m venv venv
    source venv/bin/activate

    # Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```

2.  **Install Python dependencies**:
    ```bash
    pip install -r requirements.txt
    # If the `ecdsa` library is missing, install it explicitly
    pip install ecdsa
    ```

3.  **Run the FastAPI server**:
    ```bash
    # The original command had a typo (.ts instead of .py). This is the correct command:
    uvicorn blockchain.api.server:app --reload --host 0.0.0.0 --port 5000
    ```
    *The API server will run on* `http://localhost:5000`. *The `--reload` flag enables auto-reload on code changes for development.*

#### Front-End (Next.js) Setup

1.  **Navigate to the frontend directory and install dependencies**:
    ```bash
    cd frontend # Assuming a standard project structure
    npm install
    ```

2.  **Start the development server**:
    ```bash
    npm run dev
    ```
    *The frontend will run on* `http://localhost:3000` *and should connect to the backend API.*

---

### 2. 🐳 Docker Deployment (Simplest for Testing)

1.  **Ensure Docker Daemon is running**.

2.  **Build and start the containers** from the project root:
    ```bash
    docker-compose up --build
    ```
    This command will:
    - Build images for the backend and frontend as defined in your `Dockerfile`s.
    - Start both containers.
    - Map host port 3000 to the frontend container and 5000 to the backend container.

3.  **Access the application**:
    - Frontend: `http://localhost:3000`
    - Backend API: `http://localhost:5000`

---

### 3. ☸️ Kubernetes Deployment (Production)

*Note: Requires a running Kubernetes cluster (e.g., minikube, EKS, AKS, GKE).*

1.  **Apply the Kubernetes manifests**:
    ```bash
    kubectl apply -f k8s/backend-deployment.yaml
    kubectl apply -f k8s/backend-service.yaml
    kubectl apply -f k8s/frontend-deployment.yaml
    kubectl apply -f k8s/frontend-service.yaml
    ```

2.  **Set up Ingress for external access**:
    ```bash
    # Deploy an Nginx Ingress Controller if you haven't already
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

    # Apply your Ingress manifest
    kubectl apply -f k8s/ingress.yaml
    ```

---

### 4. 📊 Monitoring & Alerting (Production)

1.  **Deploy Prometheus & Grafana** (e.g., using Helm charts or manifests):
    ```bash
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm install prometheus prometheus-community/kube-prometheus-stack
    ```

2.  **Access Grafana**:
    ```bash
    kubectl port-forward service/prometheus-grafana 3000:80
    # Open http://localhost:3000 in your browser (default login: admin/prometheus)
    ```

3.  **Deploy Alertmanager** for handling alerts from Prometheus.

---

## 🆘 Troubleshooting Common Issues

- **`ModuleNotFoundError: No module named 'ecdsa'`**:
  - **Fix**: Activate your virtual environment and run `pip install ecdsa`.

- **Ports 3000 or 5000 are already in use**:
  - **Fix**: Stop the other process using the port or change the port in the respective server's configuration/command (e.g., `--port 5001` for Uvicorn).

- **Frontend cannot connect to backend**:
  - **Fix**: Ensure the backend API URL is correctly configured in the frontend's environment variables (e.g., `NEXT_PUBLIC_API_URL=http://localhost:5000`).

- **`Address already in use` error in Kubernetes**:
  - **Fix**: This often means another service is using the same `NodePort`. Use a different port or use a `ClusterIP` service with an Ingress controller.


