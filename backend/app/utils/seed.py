import os
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import Base, engine, SessionLocal
from app.models.models import (
    User, Case, Document, Person, Vehicle, PhoneNumber, Location,
    Organization, Transaction, Communication, Event, Alert, AuditLog, EvidenceFile
)
from app.utils.security import hash_password
from app.services.graph_service import graph_service
from app.services.graph_analytics import graph_analytics

# Fixed random seed for complete scientific reproducibility
random.seed(42)

FIRST_NAMES = [
    "Rajesh", "Vikram", "Sunil", "Amit", "Rohan", "Sanjay", "Deepak", "Anil", "Manoj", "Karan",
    "Pooja", "Neha", "Priya", "Sunita", "Anita", "Ramesh", "Kavita", "Suresh", "Ajay", "Vijay",
    "Gaurav", "Manish", "Naveen", "Rahul", "Dinesh", "Harish", "Mohit", "Sachin", "Alok", "Pankaj"
]

LAST_NAMES = [
    "Sharma", "Malhotra", "Verma", "Kapoor", "Gupta", "Mehta", "Singh", "Yadav", "Chopra", "Bansal",
    "Bhatia", "Jain", "Saxena", "Chauhan", "Rawat", "Trivedi", "Mishra", "Pandey", "Shukla", "Deshmukh"
]

CITIES_LOCATIONS = [
    ("Okhla Industrial Area Ph-2", "New Delhi", 28.5355, 77.2732, "Industrial Warehouse"),
    ("Sector 18 Logistics Hub", "Noida", 28.5708, 77.3260, "Logistics Hub"),
    ("Nhava Sheva Cargo Yard", "Navi Mumbai", 18.9496, 72.9515, "Port Terminal"),
    ("Aerocity Transit Compound", "New Delhi", 28.5562, 77.1200, "Transit Facility"),
    ("Connaught Place Financial Circle", "New Delhi", 28.6315, 77.2167, "Commercial Office"),
    ("Bhiwandi Distribution Center", "Thane", 19.2967, 73.0631, "Depot"),
    ("Cyber City Commercial Tower", "Gurugram", 28.4950, 77.0895, "Office"),
    ("Salt Lake IT Sector V", "Kolkata", 22.5804, 88.4378, "Technology Complex"),
    ("Peenya Industrial Area", "Bengaluru", 13.0329, 77.5141, "Manufacturing Facility"),
    ("Sanath Nagar Freight Terminal", "Hyderabad", 17.4589, 78.4357, "Freight Yard"),
    ("Manesar Automated Depot", "Haryana", 28.3517, 76.9422, "Automated Depot"),
    ("Kundli Industrial Zone", "Sonipat", 28.8787, 77.1264, "Storage Yard")
]

ORG_NAMES = [
    "Apex Logistics Pvt Ltd", "Prime Freight Corp", "Falcon Trans-Logistics", "Delta Trading Syndicate",
    "Starlight Overseas Express", "Omega Customs Agency", "Zenith Commercial Carriers", "BlueStar Cargo",
    "Vanguard Transport Holdings", "Sunrise Trading Co", "Imperial Shipping Line", "Matrix Export Agency"
]

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("Database already contains records. Refreshing graph representations...")
            sync_existing_to_graph(db)
            return

        print("Seeding Users with Role-Based Access...")
        users = [
            User(username="admin", email="admin@crimenet.gov.in", full_name="Director S. K. Verma", role="ADMIN", hashed_password=hash_password("admin123")),
            User(username="investigator", email="investigator@crimenet.gov.in", full_name="Inspector R. K. Nair", role="INVESTIGATOR", hashed_password=hash_password("investigator123")),
            User(username="analyst", email="analyst@crimenet.gov.in", full_name="Senior Analyst Meera Sen", role="ANALYST", hashed_password=hash_password("analyst123")),
            User(username="viewer", email="viewer@crimenet.gov.in", full_name="Liaison Officer T. Roy", role="VIEWER", hashed_password=hash_password("viewer123")),
        ]
        db.add_all(users)
        db.commit()

        print("Seeding Predefined Flagship Investigation: CASE-2026-001 (Operation Hawkeye)...")
        case_001 = Case(
            id="CASE-2026-001",
            title="Operation Hawkeye: Inter-State Transport Contraband Network",
            description="Multi-jurisdiction intelligence operation investigating illicit supply lines, shell logistics companies, and high-velocity financial disbursements across NCR and maritime entry points.",
            status="ACTIVE",
            priority="CRITICAL",
            lead_investigator_id="investigator",
            category="Cross-State Contraband & Financial Network",
            created_by="admin"
        )
        case_002 = Case(
            id="CASE-2026-002",
            title="Operation Black Gold: Counterfeit Petroleum & Fuel Adulteration Ring",
            description="Inquiry into unauthorized industrial solvent diversion and illicit distribution points operating across northern transit corridors.",
            status="ACTIVE",
            priority="HIGH",
            lead_investigator_id="investigator",
            category="Commercial Adulteration & Tax Evasion",
            created_by="admin"
        )
        case_003 = Case(
            id="CASE-2026-003",
            title="Operation CyberNet: Hawala Telecommunication Overlay",
            description="Investigation into unauthorized SIM multiplexing and foreign remittance routing through non-banking financial channels.",
            status="PENDING_REVIEW",
            priority="MEDIUM",
            lead_investigator_id="investigator",
            category="Cyber Financial Crime",
            created_by="analyst"
        )
        db.add_all([case_001, case_002, case_003])
        db.commit()

        print("Generating 100 Synthetic Persons...")
        persons = []
        for i in range(1, 101):
            pid = f"P{i:03d}"
            fn = FIRST_NAMES[i % len(FIRST_NAMES)]
            ln = LAST_NAMES[(i * 3) % len(LAST_NAMES)]
            full_name = f"{fn} {ln}"
            if pid == "P001":
                full_name = "Rajesh Sharma"
            elif pid == "P014":
                full_name = "Sanjay Verma"
            elif pid == "P023":
                full_name = "Vikram Malhotra"
            elif pid == "P027":
                full_name = "Amit Kapoor"

            p = Person(
                id=pid,
                case_id="CASE-2026-001" if i <= 35 else ("CASE-2026-002" if i <= 70 else "CASE-2026-003"),
                full_name=full_name,
                aliases=[f"{fn[:3]}-{ln[:2]}", f"Alias-{i}"],
                primary_phone=f"+91 98{i:04d}210",
                primary_location="New Delhi" if i % 2 == 0 else "Mumbai",
                occupation="Transport Contractor" if i % 3 == 0 else ("Freight Broker" if i % 3 == 1 else "Warehouse Supervisor"),
                notes="Synthetic profile generated for decision-support algorithm testing."
            )
            persons.append(p)
        db.add_all(persons)
        db.commit()

        print("Generating 50 Synthetic Vehicles...")
        vehicles = []
        for i in range(1, 51):
            vid = f"V{i:03d}"
            state_code = "DL" if i % 3 == 0 else ("MH" if i % 3 == 1 else "HR")
            reg = f"{state_code}-{i:02d}-AB-{1000 + i}"
            v = Vehicle(
                id=vid,
                case_id="CASE-2026-001" if i <= 20 else "CASE-2026-002",
                registration_number=reg,
                make="Tata" if i % 2 == 0 else "Ashok Leyland",
                model="Prima Heavy" if i % 2 == 0 else "Ecomet Carrier",
                color="White" if i % 2 == 0 else "Navy Blue",
                vehicle_type="Heavy Commercial Container",
                associated_person_id=f"P{(i % 25) + 1:03d}"
            )
            vehicles.append(v)
        db.add_all(vehicles)
        db.commit()

        print("Generating 75 Synthetic Phone Numbers...")
        phones = []
        for i in range(1, 76):
            ph_id = f"PH{i:03d}"
            num = f"+91 98{i:04d}210"
            ph = PhoneNumber(
                id=ph_id,
                case_id="CASE-2026-001" if i <= 30 else "CASE-2026-002",
                phone_number=num,
                carrier="Airtel" if i % 2 == 0 else "Jio",
                registered_to=f"Subscriber {i}"
            )
            phones.append(ph)
        db.add_all(phones)
        db.commit()

        print("Generating 30 Synthetic Locations...")
        locations = []
        for i in range(1, 31):
            loc_tuple = CITIES_LOCATIONS[i % len(CITIES_LOCATIONS)]
            lid = f"LOC{i:03d}"
            loc = Location(
                id=lid,
                case_id="CASE-2026-001" if i <= 15 else "CASE-2026-002",
                name=f"{loc_tuple[0]} #{i}",
                city=loc_tuple[1],
                latitude=loc_tuple[2] + (random.uniform(-0.02, 0.02)),
                longitude=loc_tuple[3] + (random.uniform(-0.02, 0.02)),
                location_type=loc_tuple[4]
            )
            locations.append(loc)
        db.add_all(locations)
        db.commit()

        print("Generating 20 Synthetic Organizations...")
        orgs = []
        for i in range(1, 21):
            oid = f"ORG{i:03d}"
            org = Organization(
                id=oid,
                case_id="CASE-2026-001" if i <= 8 else "CASE-2026-002",
                name=ORG_NAMES[i % len(ORG_NAMES)] if i <= len(ORG_NAMES) else f"Continental Freight Alliance {i}",
                org_type="Logistics Corporation" if i % 2 == 0 else "Import-Export Syndicate",
                registration_no=f"CIN-U63090DL2024PTC{i:04d}"
            )
            orgs.append(org)
        db.add_all(orgs)
        db.commit()

        print("Generating 100 Synthetic FIR & Evidence Documents...")
        docs = []
        ev_files = []
        for i in range(1, 101):
            did = f"FIR-{1000 + i}"
            d = Document(
                id=did,
                case_id="CASE-2026-001" if i <= 50 else "CASE-2026-002",
                filename=f"FIR_{1000 + i}_Intelligence_Dispatch.txt",
                file_path=f"./uploads/FIR_{1000 + i}.txt",
                file_type="TXT",
                file_size=4250 + (i * 30),
                sha256_hash=f"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852{i:04x}",
                uploaded_by="investigator",
                extracted_entities_count=6,
                status="PROCESSED"
            )
            docs.append(d)

            # Mirror to EvidenceFile for integrity verification
            ev = EvidenceFile(
                id=f"EV-{1000 + i}",
                case_id=d.case_id,
                filename=d.filename,
                file_path=d.file_path,
                sha256_hash=d.sha256_hash,
                mime_type="text/plain",
                file_size=d.file_size,
                uploaded_by="investigator",
                verified_status="VERIFIED"
            )
            ev_files.append(ev)
        db.add_all(docs)
        db.add_all(ev_files)
        db.commit()

        print("Generating 500 Synthetic Communications (CDR)...")
        comms = []
        base_date = datetime(2026, 1, 10)
        for i in range(1, 501):
            cid = f"CDR-{1000 + i}"
            caller_idx = (i % 25) + 1
            receiver_idx = ((i * 3) % 25) + 1
            if caller_idx == receiver_idx:
                receiver_idx = (receiver_idx % 25) + 1
            
            # Create notable surge for P014
            if i % 7 == 0:
                caller_idx = 14
                receiver_idx = 1 if i % 2 == 0 else 23

            c = Communication(
                id=cid,
                case_id="CASE-2026-001" if i <= 350 else "CASE-2026-002",
                caller_phone=f"+91 98{caller_idx:04d}210",
                receiver_phone=f"+91 98{receiver_idx:04d}210",
                call_type="VOICE" if i % 3 != 0 else "ENCRYPTED_CALL",
                duration_seconds=30 + (i * 11) % 600,
                timestamp=base_date + timedelta(hours=i * 2.5),
                tower_location="Okhla Tower #4" if i % 2 == 0 else "Nhava Sheva West Gateway",
                anomaly_score=0.88 if caller_idx == 14 else 0.15
            )
            comms.append(c)
        db.add_all(comms)
        db.commit()

        print("Generating 300 Synthetic Financial Transactions...")
        txs = []
        for i in range(1, 301):
            tid = f"TX-{1000 + i}"
            is_anomaly = (i % 15 == 0)
            amount = 850000.0 if is_anomaly else float((i * 4500) % 150000 + 12000)
            t = Transaction(
                id=tid,
                case_id="CASE-2026-001" if i <= 200 else "CASE-2026-002",
                sender_account=f"ACC-6019-{100 + (i % 20)}",
                receiver_account=f"ACC-8820-{200 + ((i * 2) % 20)}",
                sender_name=f"Entity P{(i % 20) + 1:03d}",
                receiver_name=f"Entity P{((i * 2) % 20) + 1:03d}",
                amount=amount,
                timestamp=base_date + timedelta(days=(i % 60), hours=(i % 24)),
                transaction_type="RTGS_HIGH_VALUE" if is_anomaly else "IMPS_PAYMENT",
                anomaly_score=0.92 if is_anomaly else 0.05
            )
            txs.append(t)
        db.add_all(txs)
        db.commit()

        print("Generating 200 Synthetic Chronological Events...")
        events = []
        event_types = ["FIR_FILING", "SURVEILLANCE_SIGHTING", "VEHICLE_TRANSIT", "FINANCIAL_DISBURSEMENT", "COMMUNICATION_BURST"]
        for i in range(1, 201):
            eid = f"EVT-{1000 + i}"
            e_type = event_types[i % len(event_types)]
            ev_date = base_date + timedelta(days=i * 0.4)
            loc = CITIES_LOCATIONS[i % len(CITIES_LOCATIONS)]
            e = Event(
                id=eid,
                case_id="CASE-2026-001" if i <= 130 else "CASE-2026-002",
                title=f"Intelligence Event: {e_type.replace('_', ' ').title()} recorded at {loc[0]}",
                description=f"Automated sensor and investigative field log correlating entity movement across regional checkpoints.",
                event_type=e_type,
                timestamp=ev_date,
                location_name=loc[0],
                latitude=loc[2],
                longitude=loc[3],
                primary_entity_id=f"P{(i % 25) + 1:03d}"
            )
            events.append(e)
        db.add_all(events)
        db.commit()

        print("Generating Synthetic Analytical Alerts...")
        alerts = [
            Alert(
                id="ALT-2026-001",
                case_id="CASE-2026-001",
                entity_id="P014",
                alert_type="communication_anomaly",
                severity="MEDIUM",
                status="Needs Review",
                title="Statistical Communication Volume Surge (4.8x baseline)",
                reasons=[
                    "Communication volume increased 4.8x compared to 30-day baseline",
                    "Sudden cluster interchange with high-centrality entity P001 and P023",
                    "Unusual concentration of encrypted voice exchanges during night hours"
                ],
                evidence_sources=["CDR-1002", "CDR-1009", "FIR-1023"],
                score=0.82
            ),
            Alert(
                id="ALT-2026-002",
                case_id="CASE-2026-001",
                entity_id="P001",
                alert_type="network_anomaly",
                severity="HIGH",
                status="Under Review",
                title="Cross-Cluster Network Bridge Formed",
                reasons=[
                    "Entity connects two isolated graph clusters (Cluster A and Cluster B)",
                    "Betweenness centrality spiked to 0.42 within 14 days",
                    "Dual ownership of multiple heavy transport carriers recorded"
                ],
                evidence_sources=["FIR-1023", "FIR-1042", "EVENT-1015"],
                score=0.89
            ),
            Alert(
                id="ALT-2026-003",
                case_id="CASE-2026-001",
                entity_id="ORG001",
                alert_type="transaction_anomaly",
                severity="CRITICAL",
                status="New",
                title="High-Velocity Structured Financial Outflows",
                reasons=[
                    "Multi-tier fund disbursement exceeding INR 850,000 without shipment invoices",
                    "Split transfers executed in 12-minute window to non-resident accounts",
                    "Discrepancy between declared freight turnover and transaction volume"
                ],
                evidence_sources=["TX-1015", "TX-1030"],
                score=0.94
            ),
            Alert(
                id="ALT-2026-004",
                case_id="CASE-2026-001",
                entity_id="P027",
                alert_type="geographic_anomaly",
                severity="MEDIUM",
                status="New",
                title="Unusual Spatial-Temporal Co-Location",
                reasons=[
                    "Simultaneous presence logged at Nhava Sheva Port terminal prior to container movement",
                    "Discrepancy with declared resident jurisdiction in New Delhi"
                ],
                evidence_sources=["EVT-1028", "FIR-1042"],
                score=0.76
            )
        ]
        db.add_all(alerts)
        db.commit()

        print("Building Knowledge Graph Nodes & Multi-Hop Relationships...")
        build_graph_relationships(case_001.id)

        print("Sync complete. Running graph analytics...")
        graph_analytics.compute_centrality(case_001.id)
        graph_analytics.detect_communities(case_001.id)

        print("Database and Knowledge Graph successfully populated!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

def build_graph_relationships(case_id: str):
    # Register Persons in Graph
    for i in range(1, 36):
        pid = f"P{i:03d}"
        fn = FIRST_NAMES[i % len(FIRST_NAMES)]
        ln = LAST_NAMES[(i * 3) % len(LAST_NAMES)]
        label = "Rajesh Sharma" if pid == "P001" else ("Sanjay Verma" if pid == "P014" else f"{fn} {ln}")
        graph_service.add_node(case_id, pid, label, "Person", {"role": "Investigated Entity", "phone": f"+91 98{i:04d}210"})

    # Register Vehicles
    for i in range(1, 16):
        vid = f"V{i:03d}"
        graph_service.add_node(case_id, vid, f"Vehicle {vid}", "Vehicle", {"reg": f"DL-01-AB-{1000+i}"})

    # Register Phones
    for i in range(1, 21):
        ph_id = f"PH{i:03d}"
        graph_service.add_node(case_id, ph_id, f"+91 98{i:04d}210", "Phone", {"carrier": "Airtel"})

    # Register Locations
    for i in range(1, 10):
        lid = f"LOC{i:03d}"
        loc = CITIES_LOCATIONS[i % len(CITIES_LOCATIONS)]
        graph_service.add_node(case_id, lid, loc[0], "Location", {"city": loc[1], "lat": loc[2], "lon": loc[3]})

    # Register Organizations
    for i in range(1, 5):
        oid = f"ORG{i:03d}"
        graph_service.add_node(case_id, oid, ORG_NAMES[i-1], "Organization", {"type": "Logistics"})

    # BUILD 50+ RICH RELATIONSHIPS
    # P001 connects directly to 17 entities as required in Section 15 & 37!
    p001_targets = [
        ("P002", "ASSOCIATED_WITH", 0.94, "FIR-1023"),
        ("P003", "CALLED", 0.91, "CDR-1002"),
        ("P004", "WORKS_FOR", 0.88, "FIR-1024"),
        ("P005", "CONNECTED_TO", 0.85, "FIR-1025"),
        ("P006", "CALLED", 0.92, "CDR-1004"),
        ("P014", "CALLED", 0.96, "CDR-1009"),  # Bridge connector to Cluster B!
        ("V001", "OWNS", 0.98, "FIR-1023"),
        ("V002", "OWNS", 0.95, "FIR-1023"),
        ("V003", "OWNS", 0.90, "FIR-1042"),
        ("PH001", "OWNS", 0.99, "CDR-1001"),
        ("PH002", "OWNS", 0.97, "CDR-1002"),
        ("PH003", "OWNS", 0.92, "CDR-1003"),
        ("LOC001", "VISITED", 0.89, "EVENT-1005"),
        ("LOC002", "VISITED", 0.91, "EVENT-1009"),
        ("LOC003", "VISITED", 0.86, "EVENT-1015"),
        ("LOC004", "VISITED", 0.84, "EVENT-1020"),
        ("ORG001", "WORKS_FOR", 0.93, "FIR-1023")
    ]
    for target, r_type, conf, doc in p001_targets:
        graph_service.add_relationship(case_id, "P001", target, r_type, conf, source_document=doc, date="2026-01-19")

    # Connect bridge node P014 to Cluster B entities (including P023 and P027)
    cluster_b_links = [
        ("P014", "P020", "CONNECTED_TO", 0.87, "FIR-1033"),
        ("P014", "P023", "CALLED", 0.93, "CDR-1045"),  # Path link: P001 -> P014 -> P023!
        ("P023", "P027", "ASSOCIATED_WITH", 0.91, "FIR-1042"), # Path continuation: P001 -> P014 -> P023 -> P027!
        ("P020", "P021", "CALLED", 0.85, "CDR-1046"),
        ("P021", "P022", "CONNECTED_TO", 0.82, "FIR-1035"),
        ("P023", "V005", "OWNS", 0.94, "FIR-1042"),
        ("P023", "ORG002", "WORKS_FOR", 0.90, "FIR-1042"),
        ("P027", "LOC005", "VISITED", 0.88, "EVENT-1028"),
        ("P027", "ORG003", "WORKS_FOR", 0.89, "FIR-1045"),
        ("P002", "P008", "CALLED", 0.86, "CDR-1012"),
        ("P003", "V004", "OWNS", 0.92, "FIR-1026"),
        ("P004", "LOC006", "VISITED", 0.84, "EVENT-1011"),
        ("P005", "P009", "ASSOCIATED_WITH", 0.83, "FIR-1027"),
        ("P006", "P010", "CALLED", 0.89, "CDR-1018"),
        ("P008", "ORG001", "WORKS_FOR", 0.91, "FIR-1023"),
        ("P010", "V006", "OWNS", 0.88, "FIR-1030"),
        ("ORG001", "LOC001", "LOCATED_AT", 0.95, "FIR-1023"),
        ("ORG002", "LOC002", "LOCATED_AT", 0.94, "FIR-1042"),
        ("ORG003", "LOC005", "LOCATED_AT", 0.92, "FIR-1045"),
        ("P012", "P014", "CALLED", 0.87, "CDR-1030"),
        ("P015", "P014", "ASSOCIATED_WITH", 0.86, "FIR-1038"),
        ("P016", "P023", "CALLED", 0.88, "CDR-1048"),
        ("P018", "P027", "CONNECTED_TO", 0.84, "FIR-1050")
    ]
    for src, tgt, r_type, conf, doc in cluster_b_links:
        graph_service.add_relationship(case_id, src, tgt, r_type, conf, source_document=doc, date="2026-02-04")

def sync_existing_to_graph(db: Session):
    # Ensure flagship case is in graph
    build_graph_relationships("CASE-2026-001")
    graph_analytics.compute_centrality("CASE-2026-001")
    graph_analytics.detect_communities("CASE-2026-001")

if __name__ == "__main__":
    seed_database()
