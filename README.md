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


6. Usage Overview

Dashboard: Live view of blockchain health, transactions, and validator status.

Management Tools: Department and transaction controls.

Explorer: Merkle-proof-enabled block browsing.

OTC Module: Optional trading interface for DPAs.

FOI & Audit Export: Download signed data for public scrutiny.

Live Updates: Real-time feeds via WebSockets.

7. Deployment Roadmap

Development: Docker Compose for local stacks (backend, frontend, DB, Vault, monitoring).

Production: Kubernetes + Helm, managed Postgres, Vault, HTTPS (TLS with PNPKI certs).

8. Governance & Compliance

PNPKI for validator authentication and secure transport.

Tamper-proof Logs: Hash-chained audit entries anchored on-chain.

Selective Privacy: Public transparency with auditor access via zero-knowledge proofs.

Policy Alignment: Built for FOI compliance and integration with COA, DBM, PhilGEPS, and other oversight bodies.

9. Next Milestones

Optimize zero-knowledge proof generation and verification for performance.

Integrate with national systems like PhilGEPS and DBM workflows.

Pursue third-party audits and COA validation.

Launch the public portal and community engagement programs (e.g., civic tech hackathons).

10. Related News & Context

AP News: Two Philippine senators are implicated in a major flood-control corruption scandal, triggering public outrage and an independent commission. The government review follows ₱545B in flood control spending over the last three years. 
AP News

Reuters: Business and civic groups are demanding an independent probe into “excessive corruption” tied to flood-control projects—where ₱545B was spent and only 15 contractors received 20% of the funds. 
Reuters

AP News: Congress and the President have launched investigations into potential fraud in flood-control infrastructure projects, with both bodies holding televised hearings. 
AP News

11. Summary

A pioneering system ensuring every peso—accounted, verifiable, immutable. The NBB MVP is a civic-first blockchain initiative designed to restore public trust, enable citizen oversight, and embed fiscal integrity through technology.
