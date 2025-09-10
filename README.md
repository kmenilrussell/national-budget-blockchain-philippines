# National Budget Blockchain (NBB) MVP

A permissioned, auditable blockchain system for Philippine government budget transparency—making every peso traceable, immutable, and accessible in real time.

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


---
---

## 6.  Usage Overview

* **Dashboard**: Live view of blockchain health, transactions, and validator status.
* **Management Tools**: Department and transaction controls.
* **Explorer**: Merkle proof-enabled block browsing.
* **OTC Module**: Optional trading interface for DPAs.
* **FOI & Audit Export**: Download signed data for public scrutiny.
* **Live Updates**: Real-time feeds via WebSockets.

---

## 7.  Deployment Roadmap

* **Development**: Docker Compose for local stacks (backend, frontend, DB, Vault, monitoring).
* **Production**: Kubernetes + Helm, managed Postgres, Vault, HTTPS (TLS with PNPKI certs).

---

## 8.  Governance & Compliance

* **PNPKI** for validator auth and secure transport.
* **Tamper-proof Logs**: Hash-chained audit entries anchored on-chain.
* **Selective Privacy**: Public transparency + auditor see-through via ZK proofs.
* **Public Policy Alignment**: Built for FOI compliance; designed for integration with agencies like COA, DBM, and PhilGEPS.

---

## 9.  Next Milestones

* Optimize zk proof generation and verification.
* Integrate with national systems (PhilGEPS, DBM workflows).
* Pursue third-party and COA audit validation.
* Launch public portal and community engagement (civic hackathons, open forums).

---

## 10.  Related News & Context

* [Reuters](https://www.reuters.com/world/asia-pacific/philippine-groups-demand-independent-investigation-excessive-corruption-2025-09-04/?utm_source=chatgpt.com)
* [AP News](https://apnews.com/article/61deba5e59f9bc5fac1800a660591c35?utm_source=chatgpt.com)
* [AP News](https://apnews.com/article/4f032763731802d4b625d39e3a1bd1cc?utm_source=chatgpt.com)

---

## 11.  Summary

A pioneering system for ensuring **ever peso—accounted, verifiable, unerasable**—the NBB MVP is a civic-first blockchain project aimed at restoring public trust, democratizing access, and anchoring fiscal integrity in technology.

---

