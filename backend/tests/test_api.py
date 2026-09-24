import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "HEALTHY"
    assert "CRIMENET AI" in data["product"]

def test_login_and_auth():
    # Login as investigator
    res = client.post("/api/auth/login", json={"username": "investigator", "password": "investigator123"})
    assert res.status_code == 200
    token_data = res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # Verify protected route /api/auth/me
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["username"] == "investigator"

def test_cases_listing():
    res = client.post("/api/auth/login", json={"username": "investigator", "password": "investigator123"})
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    case_res = client.get("/api/cases", headers=headers)
    assert case_res.status_code == 200
    cases = case_res.json()
    assert len(cases) >= 1
    flagship = next((c for c in cases if c["id"] == "CASE-2026-001"), None)
    assert flagship is not None
    assert "Operation Hawkeye" in flagship["title"]

def test_graph_network_and_path():
    res = client.post("/api/auth/login", json={"username": "investigator", "password": "investigator123"})
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch Case-001 Graph
    graph_res = client.get("/api/graph/network/CASE-2026-001", headers=headers)
    assert graph_res.status_code == 200
    g_data = graph_res.json()
    assert len(g_data["nodes"]) > 0
    assert len(g_data["edges"]) > 0

    # Path finding between P001 and P023
    path_res = client.post("/api/graph/path", json={
        "source_id": "P001",
        "target_id": "P023",
        "max_depth": 5,
        "case_id": "CASE-2026-001"
    }, headers=headers)
    assert path_res.status_code == 200
    p_data = path_res.json()
    assert p_data["found"] is True
    assert len(p_data["paths"]) > 0

def test_analytics_and_anomalies():
    res = client.post("/api/auth/login", json={"username": "investigator", "password": "investigator123"})
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Centrality
    cent_res = client.get("/api/analytics/centrality/CASE-2026-001", headers=headers)
    assert cent_res.status_code == 200
    records = cent_res.json()["centrality_records"]
    assert len(records) > 0
    # P001 should be high centrality
    p001_stat = next((r for r in records if r["entity_id"] == "P001"), None)
    assert p001_stat is not None
    assert p001_stat["degree"] >= 10

    # Anomalies
    anom_res = client.get("/api/analytics/anomalies/CASE-2026-001", headers=headers)
    assert anom_res.status_code == 200
    assert len(anom_res.json()["anomalies"]) >= 1

def test_ai_assistant_safety():
    res = client.post("/api/auth/login", json={"username": "investigator", "password": "investigator123"})
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    ai_res = client.post("/api/ai/chat", json={
        "message": "Show connections of P001 and summarize key records",
        "case_id": "CASE-2026-001"
    }, headers=headers)
    assert ai_res.status_code == 200
    ans = ai_res.json()
    assert "answer" in ans
    assert "observations" in ans
    assert "uncertainties" in ans
    # Verify Safety: Must NEVER declare guilt
    assert "guilty" not in ans["answer"].lower()
    assert "criminal" not in ans["answer"].lower() or "network" in ans["answer"].lower()
    assert len(ans["evidence"]) > 0

def test_evidence_integrity_verification():
    res = client.post("/api/auth/login", json={"username": "investigator", "password": "investigator123"})
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List documents
    docs_res = client.get("/api/documents?case_id=CASE-2026-001", headers=headers)
    assert docs_res.status_code == 200
    docs = docs_res.json()
    assert len(docs) > 0
    ev_id = docs[0]["evidence_id"]

    # Verify integrity
    verify_res = client.get(f"/api/documents/verify/{ev_id}", headers=headers)
    assert verify_res.status_code == 200
    assert verify_res.json()["status"] == "INTEGRITY VERIFIED"
