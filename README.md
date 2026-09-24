# CRIMENET AI

### AI-Powered Criminal Network Analysis & Investigation Intelligence Platform

**CRIMENET AI** is an AI-assisted investigation intelligence and decision-support platform developed for the **Smart India Hackathon 2026**.

The platform transforms fragmented investigation data—including **FIRs, Call Detail Records (CDRs), transport registrations, financial transactions, and surveillance sightings**—into an interactive **Knowledge Graph** that helps investigators explore relationships, identify patterns, analyze anomalies, and generate evidence-grounded intelligence.

> **Important:** CRIMENET AI is a decision-support system. It does **not** automatically determine guilt, criminality, or culpability. All analytical findings are intended to serve as investigative leads that require verification and human investigator judgment.

---

## 🚀 Key Capabilities

### 1. Interactive Knowledge Graph

Visualizes complex relationships between people, phone numbers, vehicles, locations, organizations, financial accounts, and other entities.

* Multi-hop relationship exploration
* Relationship filtering
* Degree-weighted nodes
* Interactive graph visualization using Cytoscape.js
* PNG graph export
* Neo4j support with NetworkX fallback

### 2. Graph Analytics

Provides structural analysis of criminal-network data using graph algorithms.

* Degree Centrality
* Betweenness Centrality
* Community Detection
* Louvain clustering
* Network density analysis
* Identification of highly connected entities and potential bridge entities

### 3. Multi-Hop Path Analysis

Finds connection paths between entities across multiple relationships.

Example:

```text
P001
 │
 └── contacted
       ↓
     P014
       │
       └── financial transaction
             ↓
           P023
```

The system can present the relationship chain together with supporting investigation records.

### 4. Explainable Anomaly Detection

Identifies unusual patterns in investigation data, including:

* Abnormal telecom activity
* Sudden increases in communication volume
* High-velocity financial transactions
* Unusual transaction patterns
* Cross-community connections
* Sudden formation of new relationship bridges

Anomalies are presented as **analytical indicators**, not automatic conclusions of criminal activity.

### 5. Grounded AI Investigator Assistant

The platform provides an AI assistant for querying investigation documents and network information.

The assistant structures its responses into:

```text
Observed Data
↓
Analytical Inferences
↓
Uncertainties
↓
Evidence Citations
```

The current prototype supports a local RAG workflow using:

```text
Qwen2.5:7B
     ↓
Ollama
     ↓
RAG Pipeline
     ↓
Investigation Documents
     ↓
Evidence-Grounded Response
```

The system is designed to minimize unsupported AI claims by grounding responses in available investigation records.

### 6. Evidence Integrity & Reporting

Uploaded investigation documents can be assigned **SHA-256 cryptographic hashes** to help verify whether a file has changed after ingestion.

The platform can also generate structured PDF intelligence reports containing:

* Investigation summaries
* Entity relationships
* Network analysis
* Anomaly findings
* Evidence references
* Analytical observations
* Uncertainty/disclaimer sections

> Generated reports are intended as investigation-support documents. Their legal or evidentiary status depends on applicable laws, procedures, and verification by authorized personnel.

---

# 🏗️ System Architecture

```text
                         CRIMENET AI
                              │
             ┌────────────────┴────────────────┐
             │                                 │
        Investigation Data                Documents
             │                                 │
    ┌────────┼────────┐                       │
    │        │        │                       ▼
   FIR      CDR   Transactions             RAG Pipeline
    │        │        │                       │
    └────────┼────────┘                       ▼
             │                         Qwen2.5 / Ollama
             ▼                                │
      Entity Extraction                       │
             │                                │
             ▼                                │
       Knowledge Graph ◄──────────────────────┘
             │
     ┌───────┼────────┐
     │       │        │
     ▼       ▼        ▼
 Centrality Communities Anomalies
     │       │        │
     └───────┼────────┘
             ▼
      Investigation UI
             │
      ┌──────┴──────┐
      ▼             ▼
   Network       AI Assistant
    Graph        + Evidence
```

---

# 🛠️ Technology Stack

## Frontend

* React 18
* Vite
* Tailwind CSS
* Cytoscape.js
* Leaflet
* OpenStreetMap
* Recharts
* Lucide React

## Backend

* Python 3.11+
* FastAPI
* SQLAlchemy
* Pydantic V2
* ReportLab
* python-jose
* bcrypt

## Databases

* PostgreSQL — primary database
* SQLite — development/fallback database
* Neo4j — knowledge graph database
* NetworkX — graph analytics fallback

## AI & NLP

* Ollama
* Qwen2.5:7B
* Retrieval-Augmented Generation (RAG)
* Document text extraction
* Entity and relationship extraction
* Evidence-grounded question answering

---

# 🔐 Ethical & Responsible AI

CRIMENET AI follows a human-in-the-loop approach.

The system:

* Does not automatically determine guilt.
* Does not replace investigators or judicial processes.
* Separates observed facts from analytical inferences.
* Highlights uncertainty where evidence is incomplete.
* Provides supporting evidence references for AI-generated analysis.
* Uses synthetic/demo data for development and demonstration.
* Is designed to assist authorized investigators rather than make autonomous enforcement decisions.

---

# 📊 Example Investigation Workflow

```text
Upload Investigation Documents
            ↓
       Extract Text
            ↓
      Extract Entities
            ↓
 Extract Relationships
            ↓
    Build Knowledge Graph
            ↓
    Run Graph Analytics
            ↓
    Detect Anomalies
            ↓
       Query AI Assistant
            ↓
 Retrieve Supporting Evidence
            ↓
 Generate Investigation Report
```

---

# 🎯 Smart India Hackathon 2026

**Problem Statement:** SIH26189
**Title:** AI-Powered Criminal Network Analysis System
**Ministry:** Ministry of Home Affairs
**Organization:** National Crime Records Bureau (NCRB)
**Theme:** Blockchain & Cybersecurity

CRIMENET AI demonstrates how **AI, NLP, Knowledge Graphs, Graph Analytics, RAG, and cryptographic integrity mechanisms** can be combined into a unified investigation intelligence platform.

---

# ⚠️ Disclaimer

CRIMENET AI is a **prototype developed for educational, research, and hackathon demonstration purposes**.

The platform does not establish guilt, criminal liability, or factual truth by itself. Analytical results should be independently verified against authoritative records and applicable investigative procedures.

The demonstration should use synthetic or appropriately authorized data and must not expose personally identifiable or confidential investigation information.

---

# 👥 Project

Built for **Smart India Hackathon 2026 — SIH26189**

**CRIMENET AI**
*Turning fragmented investigation data into connected intelligence.*
