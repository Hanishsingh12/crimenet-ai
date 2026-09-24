import httpx

def run_sih_workflow():
    client = httpx.Client(base_url="http://127.0.0.1:8000/api", timeout=15.0)

    # 1. Login
    auth_res = client.post("/auth/login", json={"username": "investigator", "password": "investigator123"})
    assert auth_res.status_code == 200, f"Login failed: {auth_res.text}"
    token = auth_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[STEP 1] Login: SUCCESS — Token generated for Inspector R. K. Nair")

    # 2. Dashboard
    dash = client.get("/dashboard/summary", headers=headers).json()
    print(f"[STEP 2] Dashboard: Active Cases={dash['active_cases']}, Entities={dash['total_entities']}, Relations={dash['total_relationships']}, Alerts={dash['total_alerts']}")

    # 3. Flagship Case
    case = client.get("/cases/CASE-2026-001", headers=headers).json()
    print(f"[STEP 3] Flagship Case: {case['id']} — {case['title']}")

    # 4. Network Graph
    graph = client.get("/graph/network/CASE-2026-001", headers=headers).json()
    print(f"[STEP 4] Cytoscape Network: Nodes={len(graph['nodes'])}, Edges={len(graph['edges'])}")

    # 5. Entity P001 Profile
    p001 = client.get("/entities/P001", headers=headers).json()
    print(f"[STEP 5] Entity P001 Profile: {p001['name']}, Connections={p001['connections_count']}, Centrality={p001['centrality']}")

    # 6. Path Finder
    path = client.post("/graph/path", json={"source_id": "P001", "target_id": "P023", "case_id": "CASE-2026-001"}, headers=headers).json()
    print(f"[STEP 6] Path Finder P001 -> P023: Found={path['found']}, Hops={path['paths'][0]['total_hops']}, Evidence={path['paths'][0]['evidence']}")

    # 7. Timeline
    timeline = client.get("/timeline/CASE-2026-001", headers=headers).json()
    print(f"[STEP 7] Timeline Events: {len(timeline)} events loaded, Latest: {timeline[0]['title'][:40]}...")

    # 8. Anomalies & Alerts
    anoms = client.get("/analytics/anomalies/CASE-2026-001", headers=headers).json()
    print(f"[STEP 8] Anomaly Alerts: {len(anoms['anomalies'])} statistical flags detected, Flag 1={anoms['anomalies'][0]['title']}")

    # 9. AI Investigator Assistant
    ai = client.post("/ai/chat", json={"message": "Summarize important relationships in this case and cite records", "case_id": "CASE-2026-001"}, headers=headers).json()
    print(f"[STEP 9] AI Assistant Grounded Reasoning: {ai['answer'][:110]}...")
    print(f"         Observations: {len(ai['observations'])}, Inferences: {len(ai['inferences'])}, Evidence Sources: {len(ai['evidence'])}")

    # 10. PDF Report Compilation
    rep = client.post("/reports/CASE-2026-001/generate", json={"case_id": "CASE-2026-001"}, headers=headers).json()
    print(f"[STEP 10] PDF Investigation Dossier: {rep['download_url']} ({rep['file_size_bytes']} bytes)")

    print("\n>>> ALL 10 STEPS OF THE SIH 2026 DEMO WORKFLOW PASSED WITH 100% SUCCESS! <<<")

if __name__ == "__main__":
    run_sih_workflow()
