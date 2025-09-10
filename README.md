# National Budget Blockchain (NBB) 

A auditable blockchain system for Philippine government budget transparency—making every peso traceable, immutable, and accessible in real time.

---

## 1.  Vision & Background

### Why This Project Exists

Recent investigations revealed serious corruption in flood-control infrastructure spending in the Philippines:

- An audit found ₱545 billion (US$9.6B) allocated between 2022–2025 was marred by **substandard, undocumented, or non-existent projects**. Only **15 contractors received 20%** of the budget.:contentReference[oaicite:0]{index=0}  
- Contractors testified to paying **25–30% kickbacks** to legislators and officials.:contentReference[oaicite:1]{index=1}  
- Public outrage prompted President Marcos to convene an **independent commission** for investigation and suspend bidding.:contentReference[oaicite:2]{index=2}

These crises fueled public distrust and underscored the urgent need for systemic transparency.

---

## 2.  Legislative Spark: The Blockchain the Budget Bill

- **Senate Bill No. 1330**—the "Blockchain the Budget Bill" by Sen. Bam Aquino—proposes a **National Budget Blockchain System**, where every peso becomes a **Digital Public Asset (DPA)**. Citizens, COA, and civil society can audit government spending in real time.:contentReference[oaicite:3]{index=3}

If enacted, the system would be managed by DICT in coordination with DBM and COA, modernizing government transparency.:contentReference[oaicite:4]{index=4}

---

## 3.  Project Overview

This MVP features:

- **Blockchain Core**: PoA consensus, SHA-256 hashing, Merkle roots.
- **DPAs**: Budget allocation as transparent, immutable digital assets.
- **Privacy Layer**: zkLedger-inspired zero-knowledge proofs for sensitive data.
- **APIs (FastAPI)**: Access to blocks, accounts, DPAs, Merkle proofs, audit/FOI exports, and real-time metrics.
- **Frontend**: Dashboard, exploration tools, department/transaction management, OTC trading, real-time updates, i18n (EN/PH), and accessibility (WCAG 2.0 AA).
- **Security & Compliance**: JWT + RBAC auth, Vault-managed secrets, TLS/mTLS, append-only audit logs anchored on-chain.

---

## 4.  Author Credentials

Created by **Karl Russell Sumando Menil**, holder of a **Professional Certificate in Full Stack Development (MERN)** from **MIT xPRO / Emeritus**, secured on the blockchain:

- **Issued:** November 12, 2021  
- **Blockchain Anchor:** December 20, 2021  
- **Blockchain ID:** `714905`

This credential underscores verified expertise in software design and system architecture practices.

---

## 5.  Installation & Setup

### Prerequisites

- Backend: Python 3.10+, PostgreSQL
- Frontend: Node.js 18+
- Optional: Docker (for Vault)
- Production: Consider Kubernetes, Helm, and HTTPS with PKI.

### Setup Steps

```bash
# Pull repository
git clone <repo-url>
cd nbb-mvp

# Backend setup
cd backend
python3 -m venv env && source env/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql://user:pass@localhost:5432/nbb"
alembic upgrade head  # or prisma migrate deploy

# Run Vault (dev)
docker run --rm -d -p 8200:8200 -e VAULT_DEV_ROOT_TOKEN_ID="root" vault
export VAULT_ADDR=http://127.0.0.1:8200
export VAULT_TOKEN=root

# Launch backend
uvicorn api.server:app --reload

# Frontend setup
cd ../frontend
npm install
npm run dev  # http://localhost:3000

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
