# National Budget Blockchain (NBB) MVP

A permissioned, auditable blockchain system for Philippine government budget transparency, designed to make every peso traceable, immutable, and accessible in real time.

---

## 1.  Vision & Background

### Why This Project Exists

The Philippines is currently facing widespread corruption in government infrastructure spending—especially in **flood control projects**. A mass of investigative findings reveal:

- **545 billion PHP** was allocated since 2022, with many projects **substandard, undocumented, or non-existent**, and only **15 contractors receiving 20%** of the funds.:contentReference[oaicite:0]{index=0}  
- At least **17 members of Congress and DPWH officials** have been implicated in allegations of **25–30% kickbacks**, based on sworn testimony.:contentReference[oaicite:1]{index=1}  
- These revelations spurred public outrage and government reform, including establishment of independent commissions and suspension of new project biddings.:contentReference[oaicite:2]{index=2}

In response, **Senate Bill No. 1330 ("Blockchain the Budget Bill")**, authored by **Sen. Bam Aquino**, proposes placing the entire **national budget on a blockchain**—making every peso **traceable, auditable, and publicly accessible**. This would position the Philippines as a global leader in civic-tech governance.:contentReference[oaicite:3]{index=3}

---

## 2.  Project Overview

The NBB MVP prototype includes:

- **Blockchain Core**: PoA consensus with rotating validators, SHA-256 hashing, and Merkle trees.
- **Digital Public Assets (DPAs)**: All budget allocations and transfers are tracked as immutable assets.
- **Privacy**: zkLedger-style zero-knowledge proofs to hide sensitive amounts from the public, yet auditable by authorized parties.
- **Web API (FastAPI)** with endpoints for:
  - Blocks, Accounts, DPAs, Merkle proofs  
  - Audit/FOI data export (CSV/JSONL, digitally signed)  
  - Real-time metrics (Prometheus)
- **Frontend Dashboard**: Explorer, department & transaction management, OTC trading, real-time updates (polling/WebSockets), full accessibility (WCAG 2.0 AA), and localization (EN/PH).
- **Security & Compliance**: JWT + RBAC auth, Vault-managed secrets, TLS/mTLS, append-only audit logs with on-chain anchoring, and legal retention (WORM).

---

## 3.  Author Credentials

This project is developed by **Karl Russell Sumando Menil**, holder of a **Professional Certificate in Full Stack Development (MERN)** from **MIT xPRO / Emeritus**, which is **secured by blockchain**:

- **Credential Issued On**: November 12, 2021  
- **Blockchain Record Created On**: December 20, 2021  
- **Blockchain ID**: `714905`

This certificate demonstrates verified expertise in full-stack engineering and reinforces the credibility of the system’s trustless architecture.

---

## 4.  Installation & Setup

### Prerequisites

- **Backend**: Python 3.10+, PostgreSQL
- **Frontend**: Node.js 18+ (npm/yarn)
- **Optional (for key storage)**: Docker (for local Vault)
- Planning for production: Docker Compose, Kubernetes, HTTPS with PKI.

### Setup Guide

```bash
# Clone repo
git clone <repo-url>
cd nbb-mvp

# Backend setup
cd backend
python3 -m venv env && source env/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql://user:pass@localhost:5432/nbb"
alembic upgrade head  # or `prisma migrate deploy`

# Vault (development mode)
docker run --rm -d -p 8200:8200 -e VAULT_DEV_ROOT_TOKEN_ID="root" vault
export VAULT_ADDR=http://127.0.0.1:8200
export VAULT_TOKEN=root

# Run backend API
uvicorn api.server:app --reload

# Frontend setup
cd frontend
npm install
npm run dev  # Access at http://localhost:3000

5. Usage Snapshot

Dashboard: Real-time overview of blocks, transactions, and validator status.

Departments: Manage government agencies, allocate budgets.

Transactions: Issue, transfer, and record DPAs.

Explorer: Browse blockchain data with Merkle proof generation.

OTC: Optional module for trading DPAs in secure bilateral fashion.

FOI / Audit Export: Download signed output for public and auditor use.

Real-Time Updates: Live data sync via WebSockets.

6. Deployment Path

Development: Use Docker Compose (backend, frontend, Postgres, Vault, Prometheus, Grafana).

Production:

Deploy backend & frontend in Kubernetes with Helm.

Use managed DB (Postgres) and secrets (HashiCorp Vault).

Host over HTTPS, with mutually authenticated TLS for validator communications (using PNPKI where available).

7. Governance & Compliance

Supports PNPKI for issuing/validator identity and transport-level authentication.

Log Auditing: Append-only logs, chained with content hashes; periodic on-chain anchoring ensures tamper evidence.

Privacy & Access: Confidential DPA amounts hidden, yet verifiable by auditors via ZK proofs.

Policy Integration: Designed to integrate with PhilGEPS, eNGAS, COA, DBM, and system-of-record platforms.

Aligns with Philippine FOI Act, legal retention mandates, and government security standards.

8. Next Milestones

Optimize zk proof performance via batching or improved libraries.

Expand API for integrations (PhilGEPS, DBM, etc.).

Conduct third-party security audits and COA validation.

Launch public-facing portal and engage civil society via hackathons.

9. News & Context
Related News

https://apnews.com/article/philippines-flood-control-corruption-allegations-61deba5e59f9bc5fac1800a660591c35
https://www.reuters.com/world/asia-pacific/philippine-groups-demand-independent-investigation-excessive-corruption-2025-09-04/?utm_source=chatgpt.com

10. Summary

A blockchain-based budget ledger for the Philippines—built to restore trust, empower oversight, and ensure fiscal accountability. Citizens, auditors, and departments alike gain a secure, transparent, and auditable system—so every peso, every peso counts.
