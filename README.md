# National Budget Blockchain (NBB)

An auditable blockchain system for Philippine government budget transparency—making every peso traceable, immutable, and accessible in real time.

---

## 1. Vision & Background

### Why This Project Exists

Recent investigations revealed serious corruption in flood-control infrastructure spending in the Philippines:

* An audit found ₱545 billion (US\$9.6B) allocated between 2022–2025 was marred by **substandard, undocumented, or non-existent projects**. Only **15 contractors received 20%** of the budget.
* Contractors testified to paying **25–30% kickbacks** to legislators and officials.
* Public outrage prompted President Marcos to convene an **independent commission** for investigation and suspend bidding.

These crises fueled public distrust and underscored the urgent need for systemic transparency.

---

## 2. Legislative Spark: The Blockchain the Budget Bill

* **Senate Bill No. 1330**—the "Blockchain the Budget Bill" by Sen. Bam Aquino—proposes a **National Budget Blockchain System**, where every peso becomes a **Digital Public Asset (DPA)**. Citizens, COA, and civil society can audit government spending in real time.

If enacted, the system would be managed by DICT in coordination with DBM and COA, modernizing government transparency.

---

## 3. Project Overview

This MVP features:

* **Blockchain Core**: PoA consensus, SHA-256 hashing, Merkle roots.
* **DPAs**: Budget allocation as transparent, immutable digital assets.
* **Privacy Layer**: zkLedger-inspired zero-knowledge proofs for sensitive data.
* **APIs (FastAPI)**: Access to blocks, accounts, DPAs, Merkle proofs, audit/FOI exports, and real-time metrics.
* **Frontend**: Dashboard, exploration tools, department/transaction management, OTC trading, real-time updates, i18n (EN/PH), and accessibility (WCAG 2.0 AA).
* **Security & Compliance**: JWT + RBAC auth, Vault-managed secrets, TLS/mTLS, append-only audit logs anchored on-chain.

---

## 4. Author Credentials

Created by **Karl Russell Sumando Menil**, holder of a **Professional Certificate in Full Stack Development (MERN)** from **MIT xPRO / Emeritus**, secured on the blockchain:

* **Issued:** November 12, 2021
* **Blockchain Anchor:** December 20, 2021
* **Blockchain ID:** `714905`

This credential underscores verified expertise in software design and system architecture practices.

---

## Setup Instructions for National Budget Blockchain Project

These steps will help you deploy and run both the front-end (Next.js/Node.js) and the back-end (Python blockchain) on your local machine, in Docker, on Kubernetes, via Helm, with Ingress, monitoring, and alerting.

---

### 1. Prerequisites

* **Node.js**: v18 or newer (LTS recommended).
* **npm**: Installed with Node.js.
* **Python**: v3.9 or newer.
* **pip**: Python package manager.
* **Git**: For cloning the repository (optional if you already have the code).
* **Docker & Docker Compose**: For containerized deployment.
* **Kubernetes + kubectl**: For orchestration in production.
* **Helm**: For managing Kubernetes manifests.
* **Ingress Controller (e.g., Nginx Ingress)**: For external access with TLS.
* **Prometheus, Grafana & Alertmanager**: For monitoring, visualization, and alerts.

---

### 2. Front-End (Next.js)

1. Navigate to project directory:

   ```bash
   cd national-budget-blockchain-philippines-main
   ```
2. Install Node dependencies:

   ```bash
   npm install
   ```
3. Start development server:

   ```bash
   npm run dev
   ```

   * App runs at [http://localhost:3000](http://localhost:3000).

### 3. Back-End (Python Blockchain)

1. Create virtual environment (optional):

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```
2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

   If missing, install core library:

   ```bash
   pip install ecdsa
   ```
3. Run API server:

   ```bash
   PYTHONPATH=. python3 blockchain/api/server.ts get_chain
   ```

### 4. Running Both Together

* Run backend in one terminal.
* Run frontend in another terminal.
* The frontend connects via Socket.IO to the backend.

---

### 5. Docker Deployment

* Create Dockerfiles for backend and frontend.
* Example `docker-compose.yml`:

```yaml
version: '3.9'
services:
  backend:
    build:
      context: .
      dockerfile: blockchain-backend/Dockerfile
    ports:
      - "5000:5000"
  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

* Start containers:

```bash
docker-compose up --build
```

---

### 6. Kubernetes Deployment

* Example manifests for backend and frontend (Deployments + Services).
* Apply them:

```bash
kubectl apply -f backend.yaml
kubectl apply -f frontend.yaml
```

---

### 7. Helm Chart Template

(Full Chart.yaml, values.yaml, and templates for backend and frontend as provided earlier.)

---

### 8. Ingress with TLS

* Example `ingress.yaml` for frontend + backend.
* Use cert-manager with Let’s Encrypt for TLS certificates.
* Apply resources:

```bash
kubectl apply -f ingress.yaml
kubectl apply -f cluster-issuer.yaml
```

---

### 9. Monitoring with Prometheus and Grafana

* Deploy Prometheus and Grafana with manifests.
* Access Grafana via LoadBalancer service.
* Add Prometheus as Grafana data source.
* Create dashboards for blockchain metrics.

---

### 10. Alerting with Alertmanager & Grafana Alerts

* Deploy Alertmanager with config.
* Define Prometheus alert rules (e.g., transaction failures, backend downtime).
* Optionally configure Grafana alerts.
* Apply resources:

```bash
kubectl apply -f alertmanager.yaml
kubectl apply -f alert-rules.yaml
```

---

### 11. Troubleshooting

* **ModuleNotFoundError: ecdsa** → install with `pip install ecdsa`.
* Ensure ports (3000 frontend, 5000 backend) are free.
* Balance errors → initialize balances in state manager.

---

### 12. Production Deployment

* **Bare metal**: `npm run build && npm run start`
* **Docker**: `docker-compose -f docker-compose.yml up -d`
* **Kubernetes**: `kubectl apply -f k8s-manifests/`
* **Helm**: `helm install nbb ./helm` or `helm upgrade nbb ./helm`
* **Ingress**: Point DNS to cluster load balancer, then apply ingress manifests.
* **Monitoring & Alerting**: Use Grafana dashboards and Alertmanager notifications.

---

By following these steps, you’ll have the National Budget Blockchain project running locally, with Docker, at scale on Kubernetes, managed with Helm, securely exposed with TLS, monitored with Prometheus + Grafana, and protected with real-time alerts via Alertmanager or Grafana.
