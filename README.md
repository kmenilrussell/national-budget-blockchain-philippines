Below is your fully formatted **README.md** with the requested sections integrated and enriched with **verified news citations** to provide context and credibility. I've also added a `navlist` element at the end to highlight news sources.

---

````markdown
# National Budget Blockchain (NBB) MVP

A permissioned, auditable blockchain system for Philippine government budget transparency—ensuring every peso is traceable, immutable, and accessible in real time.

---

## 1.  Vision & Background

Why this project exists:

- Legislative and infrastructure corruption scandals have rocked the Philippines, especially in flood-control projects. An audit revealed **₱545 billion (US$9.6B)** spent since 2022, with only **15 contractors receiving 20%** of the total budget.([Reuters](https://www.reuters.com/world/asia-pacific/philippine-groups-demand-independent-investigation-excessive-corruption-2025-09-04/?utm_source=chatgpt.com))  
- Testimonies in televised congressional hearings accused at least **17 legislators and several DPWH officials** of demanding **25–30% kickbacks**.([AP News](https://apnews.com/article/61deba5e59f9bc5fac1800a660591c35?utm_source=chatgpt.com))  
- These revelations triggered public outcry, an independent commission, and project suspensions.([AP News](https://www.apnews.com/article/4f032763731802d4b625d39e3a1bd1cc?utm_source=chatgpt.com))

---

## 2.  Legislative Spark: The Blockchain the Budget Bill

- **Senate Bill No. 1330**, authored by **Sen. Bam Aquino**, proposes a **National Budget Blockchain System**—where every peso of public funds becomes visible and auditable in real-time.([Medium](https://medium.com/thecapital/blockchain-the-budget-bill-sbn-1330-revolutionizing-fiscal-transparency-in-the-philippines-4968846ad713), [Senate Press Release](https://web.senate.gov.ph/press_release/2025/0902_aquino1.asp?utm_source=chatgpt.com))
- If enacted, DICT would coordinate with DBM and COA to integrate blockchain into national transparency protocols.([Senate Press Release](https://web.senate.gov.ph/press_release/2025/0902_aquino1.asp?utm_source=chatgpt.com))

---

## 3.  Project Overview

This MVP includes:

- **Blockchain Core**: PoA consensus, SHA-256 hashing, and Merkle roots.
- **DPAs**: Budget allocations as immutable Digital Public Assets.
- **Privacy Layer**: zkLedger-style zero-knowledge proofs for confidentiality with audit access.
- **APIs (FastAPI)**: Interfaces for blocks, accounts, DPAs, Merkle proofs, audit/FOI downloads, and real-time metrics.
- **Frontend Dashboard**: Explorer, department/transaction tools, optional OTC module, real-time updates, EN/PH localization, and WCAG-compliant accessibility.
- **Security & Compliance**: JWT + RBAC auth, Vault-managed keys, TLS/mTLS, and cryptographically anchored audit logs.

---

## 4.  Author Credentials

**Karl Russell Sumando Menil**, developer of this project, holds a **Professional Certificate in Full Stack Development (MERN)** from **MIT xPRO / Emeritus**:

- **Issued**: November 12, 2021  
- **Blockchain Anchor**: December 20, 2021  
- **Blockchain ID**: `714905`

A blockchain-secured credential that underscores expertise in system architecture and full-stack design.

---

## 5.  Installation & Setup

### Requirements

- Backend: Python 3.10+, PostgreSQL  
- Frontend: Node.js 18+  
- Optional: Docker (for Vault)  
- Easy production deployment: Docker Compose, Kubernetes, HTTPS with PKI

### Setup Steps

```bash
# Clone repo
git clone <repo-url>
cd nbb-mvp

# Backend
cd backend
python3 -m venv env && source env/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql://user:pass@localhost:5432/nbb"
alembic upgrade head  # or prisma migrate deploy

# Dev Vault
docker run --rm -d -p 8200:8200 -e VAULT_DEV_ROOT_TOKEN_ID="root" vault
export VAULT_ADDR=http://127.0.0.1:8200
export VAULT_TOKEN=root

# Run backend
uvicorn api.server:app --reload

# Frontend
cd ../frontend
npm install
npm run dev  # Navigate to http://localhost:3000
````

---

## 6.  Usage Overview

* **Dashboard**: View blockchain health, recent transactions, and validator rotation live.
* **Management Tools**: Manage agency budgets and transaction workflows.
* **Explorer**: Browse blocks and validate transactions via Merkle proofs.
* **OTC Module**: (Optional) Facilitates secure bilateral DPA trading.
* **FOI & Audit Export**: Download signed CSV/JSONL for public transparency.
* **Live Updates**: Real-time UI updates via WebSockets.

---

## 7.  Deployment Roadmap

* **Development**: Use Docker Compose for backend, frontend, DB, Vault, and monitoring tools.
* **Production**: Deploy via Kubernetes + Helm, utilize managed Postgres and Vault, and serve with HTTPS using PNPKI or equivalent PKI infrastructure.

---

## 8.  Governance & Compliance

* **PNPKI** for validator and transport-level authentication.
* **Tamper-proof Logs**: Audit entries chained by hash and anchored on-chain.
* **Selective Privacy**: Publicly transparent with auditor-level access via ZK proofs.
* **Policy Alignment**: Designed for FOI compliance and interoperability with COA, DBM, and PhilGEPS.

---

## 9.  Next Milestones

* **Optimize ZK Proofs**: Improve performance and batching.
* **System Integrations**: Hook into PhilGEPS, DBM workflows.
* **Security Audits**: Engage external auditors and COA for validation.
* **Public Launch**: Deploy citizen-facing portal and host civic hackathons.

---

## 10.  Related News & Context

* [Reuters](https://www.reuters.com/world/asia-pacific/philippine-groups-demand-independent-investigation-excessive-corruption-2025-09-04/?utm_source=chatgpt.com)
* [AP News](https://apnews.com/article/61deba5e59f9bc5fac1800a660591c35?utm_source=chatgpt.com)
* [AP News](https://apnews.com/article/4f032763731802d4b625d39e3a1bd1cc?utm_source=chatgpt.com)

---

## 11.  Summary

A pioneering civic-tech initiative—designed so that **every peso** is accounted for, verifiable, and immutable. The NBB MVP aims to restore public trust, enable citizen oversight, and deliver transparent fiscal governance powered by blockchain.

```

---

Let me know if you'd like this zipped for direct download, versioned for GitHub, or enhanced with usage badges or images!
::contentReference[oaicite:1]{index=1}
```
