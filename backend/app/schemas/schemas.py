from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, EmailStr, Field

# Auth & User
class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    role: str = "ANALYST"

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# Case
class CaseBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "HIGH"
    category: str = "Organized Crime Network"
    status: str = "ACTIVE"
    lead_investigator_id: Optional[str] = None

class CaseCreate(CaseBase):
    id: Optional[str] = None

class CaseResponse(CaseBase):
    id: str
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    entities_count: Optional[int] = 0
    relationships_count: Optional[int] = 0
    alerts_count: Optional[int] = 0

    class Config:
        from_attributes = True

# Entities
class EntitySearchItem(BaseModel):
    id: str
    name: str
    entity_type: str  # Person, Phone, Vehicle, Location, Organization, Case, BankAccount
    connections_count: int = 0
    cases_count: int = 1
    case_id: Optional[str] = None
    extra_info: Optional[str] = None

class EntityDetailResponse(BaseModel):
    id: str
    entity_type: str
    name: str
    aliases: List[str] = []
    case_id: Optional[str] = None
    attributes: Dict[str, Any] = {}
    connections_count: int = 0
    cases_count: int = 0
    centrality: Dict[str, float] = {
        "degree": 0.0,
        "betweenness": 0.0,
        "pagerank": 0.0
    }
    related_records: List[Dict[str, Any]] = []
    associated_vehicles: List[Dict[str, Any]] = []
    associated_phones: List[Dict[str, Any]] = []
    associated_locations: List[Dict[str, Any]] = []
    alerts: List[Dict[str, Any]] = []

# Graph
class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # Person, Phone, Vehicle, Location, Organization, Case, BankAccount, Event
    cluster: Optional[str] = "Cluster A"
    properties: Dict[str, Any] = {}
    degree: Optional[int] = 0
    betweenness: Optional[float] = 0.0
    pagerank: Optional[float] = 0.0

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str  # CALLED, OWNS, VISITED, WORKS_FOR, ASSOCIATED_WITH, etc.
    label: str
    confidence: float = 0.90
    date: Optional[str] = None
    source_document: Optional[str] = None
    properties: Dict[str, Any] = {}

class GraphDataResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    case_id: Optional[str] = None
    stats: Dict[str, int] = {}

class PathRequest(BaseModel):
    source_id: str
    target_id: str
    max_depth: int = 5
    case_id: Optional[str] = None

class PathFoundItem(BaseModel):
    nodes: List[GraphNode]
    relationships: List[GraphEdge]
    evidence: List[str] = []
    total_hops: int = 0

class PathResponse(BaseModel):
    found: bool
    paths: List[PathFoundItem]
    message: Optional[str] = None

# Analytics
class CentralityScore(BaseModel):
    entity_id: str
    name: str
    type: str
    degree: int
    betweenness: float
    pagerank: float
    analytical_label: str  # e.g., "High network centrality", "Bridge entity", "Highly connected entity"

class CentralityResponse(BaseModel):
    case_id: str
    centrality_records: List[CentralityScore]

class ClusterGroup(BaseModel):
    cluster_id: str
    cluster_name: str
    color: str
    member_ids: List[str]
    size: int
    dominant_type: str

class ClusterResponse(BaseModel):
    case_id: str
    clusters: List[ClusterGroup]

class AnomalyItem(BaseModel):
    id: str
    type: str  # communication_anomaly, transaction_anomaly, geographic_anomaly, network_anomaly
    entity_id: str
    entity_name: Optional[str] = None
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    score: float
    status: str    # New, Under Review, Confirmed by Analyst, Dismissed
    title: str
    reasons: List[str]
    evidence: List[str]
    detected_at: str
    analyst_notes: Optional[str] = None

class AnomalyResponse(BaseModel):
    case_id: str
    anomalies: List[AnomalyItem]

class AlertStatusUpdate(BaseModel):
    status: str
    analyst_notes: Optional[str] = None

# Documents & Evidence
class DocumentUploadResponse(BaseModel):
    success: bool
    document_id: str
    filename: str
    file_type: str
    sha256_hash: str
    integrity_status: str = "INTEGRITY VERIFIED"
    extracted_entities: Dict[str, int] = {}
    extracted_relationships_count: int = 0
    message: str

class EvidenceVerifyResponse(BaseModel):
    evidence_id: str
    filename: str
    stored_hash: str
    current_hash: str
    status: str  # INTEGRITY VERIFIED or INTEGRITY MISMATCH
    verified_at: datetime
    uploaded_by: Optional[str] = None

# AI Assistant
class AIChatRequest(BaseModel):
    message: str
    case_id: Optional[str] = "CASE-2026-001"
    focus_entity_id: Optional[str] = None

class AIEvidenceSource(BaseModel):
    id: str
    type: str
    summary: Optional[str] = None

class AIChatResponse(BaseModel):
    answer: str
    observations: List[str] = []
    inferences: List[str] = []
    uncertainties: List[str] = []
    evidence: List[AIEvidenceSource] = []
    model_used: str = "qwen2.5:7b"
    intent: Optional[str] = None
    safety_disclaimer: str = (
        "Strictly decision-support output. This analytical insight does not establish guilt "
        "and requires human investigator verification."
    )

# Timeline
class TimelineEventItem(BaseModel):
    id: str
    timestamp: str
    title: str
    event_type: str
    description: Optional[str] = None
    location_name: Optional[str] = None
    primary_entity_id: Optional[str] = None
    primary_entity_name: Optional[str] = None
    case_id: str

# Geo / Map
class MapLocationItem(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    location_type: str
    address: Optional[str] = None
    case_id: str
    related_entities: List[str] = []
    event_count: int = 0

# Reports
class ReportGenerateRequest(BaseModel):
    case_id: str
    include_network: bool = True
    include_timeline: bool = True
    include_anomalies: bool = True
    include_evidence: bool = True
    analyst_notes: Optional[str] = None

class ReportResponse(BaseModel):
    report_id: str
    case_id: str
    download_url: str
    created_at: datetime
    file_size_bytes: int

# Audit Log
class AuditLogResponse(BaseModel):
    id: str
    user_id: str
    username: Optional[str] = None
    action: str
    resource: str
    timestamp: datetime
    metadata_json: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None

    class Config:
        from_attributes = True

# Dashboard
class DashboardSummaryResponse(BaseModel):
    active_cases: int
    total_entities: int
    total_relationships: int
    total_alerts: int
    total_documents: int
    total_clusters: int
    recent_alerts: List[AnomalyItem] = []
    entity_type_breakdown: Dict[str, int] = {}
    relationship_type_breakdown: Dict[str, int] = {}
    cases_over_time: List[Dict[str, Any]] = []
    alert_trends: List[Dict[str, Any]] = []
