# CRIMENET AI

### AI-Powered Criminal Network Analysis & Investigation Intelligence Platform
**Smart India Hackathon 2026 — Production-Quality Prototype**

---

## 1. Project Overview

**CRIMENET AI** is a decision-support and investigation-analysis system engineered for law enforcement agencies and intelligence analysts. It transforms fragmented, multi-source crime data (telecom CDRs, FIR filings, transport registry, financial ledgers, and surveillance sightings) into an interactive knowledge graph. 

### Mandatory Analytical Safeguard
> **CRITICAL LEGAL NOTICE:**  
> CRIMENET AI is strictly an **investigative decision-support platform**. The system **never declares guilt or criminality automatically**. All findings are classified as analytical leads, anomalies, or structural relationships requiring human investigator verification.

---

## 2. Technology Stack

* **Frontend:** React.js 18, Vite, Tailwind CSS, Cytoscape.js, Leaflet + OpenStreetMap, Recharts, Lucide React, Axios, React Router.
* **Backend:** Python 3.11+, FastAPI, Uvicorn, SQLAlchemy, Pydantic V2, python-jose, bcrypt, ReportLab (PDF compiler).
* **Databases:**
  * **Relational:** PostgreSQL (primary) with automatic local SQLite fallback for seamless standalone execution.
  * **Graph:** Neo4j (bolt driver) with an integrated in-memory NetworkX graph engine fallback.
* **AI & NLP:** Local Ollama service (`qwen2.5:7b`), configurable model switcher (Llama3, Mistral, Gemma, Qwen3), regex entity extractor, multi-attribute normalizer, and grounded RAG query builder.

---

## 3. High-Level Architecture

```text
                         ┌──────────────────────┐
                         │   React 18 + Vite    │
                         │ Cytoscape + Leaflet  │
                         └──────────┬───────────┘
                                    │ REST API (JWT)
                                    ▼
                         ┌──────────────────────┐
                         │       FastAPI        │
                         │    API Gateway       │
                         └──────────┬───────────┘
                                    │
             ┌──────────────────────┼─────────────────────┐
             │                      │                     │
             ▼                      ▼                     ▼
      PostgreSQL / SQLite       Neo4j / NetworkX       AI Engine
      (Structured Records)    (Relational Knowledge)   (Local Ollama)
             │                      │                     │
             ▼                      ▼                     ▼
        Cases, Users,          Multi-Hop Graph,        Qwen2.5:7b
       Evidence Hashes           Centrality,              RAG
                               Louvain Clusters
```

---

## 4. Key Capabilities & Features

1. **Synthetic Investigation Datasets:** 100 persons, 50 heavy vehicles, 75 phone lines, 30 locations, 20 corporate entities, 100 FIR documents, 500 CDR communications, 300 transactions, 200 events.
2. **Flagship Demo Investigation (`CASE-2026-001`):** *Operation Hawkeye* with 25 persons, central hub `P001` (17 connections), bridge node `P014`, and verifiable paths.
3. **Interactive Knowledge Graph:** Cytoscape.js with degree-weighted node sizing, cluster colors, zoom/pan/filter, and PNG export.
4. **Graph Centrality Analytics:** Degree centrality, Betweenness centrality (bridge detection), and PageRank.
5. **Community Detection:** Modularity clustering dividing entities into distinct analytical clusters (`Cluster A`, `Cluster B`, etc.).
6. **Shortest Path Traversal:** Discovers and visualizes indirect connection chains between entities (e.g. `P001` → `P014` → `P023`) citing supporting records.
7. **Explainable Anomaly Detection:**
   * **Communication surge:** 4.8x baseline volume alert.
   * **Transaction velocity:** INR 850,000 structured outflow detection.
   * **Network anomaly:** Rapid cross-cluster bridge formation.
8. **AI Investigator Assistant (Grounded RAG):** Local LLM answering natural-language inquiries with strict separation of Observations, Analytical Inferences, Uncertainties, and Record Citations.
9. **Cryptographic Evidence Integrity:** SHA-256 signatures generated upon document upload with live verification badges.
10. **Automated PDF Reports:** Compiles official intelligence dossiers with topology metrics, anomalies, notes, and statutory disclaimers.
11. **Immutable Audit Trail:** Tracks all logins, graph queries, AI prompts, and evidence verifications.

---

## 5. Demonstration Credentials

The platform provides pre-seeded accounts and 1-click role demo buttons on the login screen:

| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Investigator** | `investigator` | `investigator123` | Case management, graph exploration, AI queries |
| **Senior Analyst** | `analyst` | `analyst123` | Anomaly confirmation and hypothesis testing |
| **Administrator** | `admin` | `admin123` | System oversight and case registration |
| **Auditor / Viewer** | `viewer` | `viewer123` | Read-only compliance and audit verification |

---

## 6. Official 10-Step SIH Evaluation Workflow

Execute this exact sequence during presentation:

1. **Open Dashboard (`/dashboard`):** Review metric cards, FIR timeline area chart, entity breakdown, and anomaly queue.
2. **Open Flagship Case (`/cases/CASE-2026-001`):** Click *Launch Case Investigation* to enter Operation Hawkeye.
3. **Interactive Network Graph:** Inspect 54 relationships. Filter by relationship type (e.g., `CALLED`, `OWNS`).
4. **Select Entity `P001`:** Click Rajesh Sharma to open the side dossier showing 17 connections, betweenness 0.42, 3 vehicles, and 3 phones.
5. **Shortest Path Finder:** Click *Trace Graph Path* from `P001` to `P023`. Observe multi-hop connection via bridge node `P014` with supporting records `FIR-1023` and `CDR-1045`.
6. **Temporal Timeline (`/timeline`):** Inspect chronological development of transit sightings, telecom bursts, and financial transfers.
7. **Alert Center (`/alerts`):** Review the 4.8x communication surge alert for `P014` and execute *Confirm Lead* analyst workflow.
8. **AI Assistant Reasoning (`/ai-assistant`):** Ask *"Summarize the important relationships in this case and cite supporting records."* View grounded observations and citations without hallucinations.
9. **Evidence Integrity (`/documents`):** Upload a test file, observe instant SHA-256 hash generation, and click *INTEGRITY VERIFIED*.
10. **PDF Dossier Export (`/reports`):** Click *Generate Official Investigation PDF Report* and download the styled court-admissible dossier.

---

## 7. Local Setup & Execution Guide

### Prerequisites
* Python 3.11+
* Node.js 18+ and npm
* Optional: Docker & Docker Compose
* Optional: Ollama (for local LLM inference)

---

### Method A: Native Local Execution (Fastest for Demo)

#### 1. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed the database and build graph
python -m app.utils.seed

# Start FastAPI backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*API Swagger Documentation is available at: `http://localhost:8000/docs`*

#### 2. Frontend Setup
```bash
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```
*Application UI is available at: `http://localhost:5173`*

---

### Method B: Docker Compose

```bash
# Start all 5 microservices (Postgres, Neo4j, Ollama, Backend, Frontend)
docker compose up -d

# Pull the Qwen model into the Ollama container
docker exec -it crimenet_ollama ollama pull qwen2.5:7b
```

---

## 8. Ollama Local LLM Configuration

To connect real local LLM inference:
1. Install [Ollama](https://ollama.ai)
2. Run: `ollama pull qwen2.5:7b`
3. Start: `ollama serve`

*Note: If Ollama is offline or uninstalled, CRIMENET AI automatically activates its high-performance local heuristic rule engine, ensuring 100% demo uptime without crashes.*

---

## 9. Test Suite Verification

Run backend unit and integration tests:
```bash
cd backend
pytest tests/test_api.py -v
```
All 7 critical integration tests verify:
* JWT authentication & route security
* Knowledge graph structure & edge connectivity
* Shortest path multi-hop resolution
* Centrality metrics (Degree, Betweenness, PageRank)
* AI safety guardrails (prohibition of guilt declarations)
* Cryptographic SHA-256 evidence integrity verification

---

## 10. Statutory Safeguards & Ethical AI

* **Strictly Decision-Support:** AI outputs are framed as analytical leads requiring field verification.
* **No Hallucinations:** RAG prompt structures ensure only retrieved database and graph IDs are cited.
* **Tamper-Evident:** All investigations maintain an immutable SHA-256 cryptographic chain of custody.
* **No Real-World Data:** All names, telephone numbers, and addresses are synthetically generated.
