import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), default="ANALYST", nullable=False)  # ADMIN, INVESTIGATOR, ANALYST, VIEWER
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Case(Base):
    __tablename__ = "cases"

    id = Column(String(50), primary_key=True)  # e.g., CASE-2026-001
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(30), default="ACTIVE")  # ACTIVE, PENDING_REVIEW, CLOSED, ARCHIVED
    priority = Column(String(20), default="HIGH")   # LOW, MEDIUM, HIGH, CRITICAL
    lead_investigator_id = Column(String(50), nullable=True)
    category = Column(String(100), default="Organized Crime Network")
    created_by = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(50), primary_key=True)  # e.g., DOC-1001 or FIR-1023
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), default="TXT")  # CSV, JSON, TXT, PDF
    file_size = Column(Integer, default=0)
    sha256_hash = Column(String(64), nullable=False, index=True)
    case_id = Column(String(50), ForeignKey("cases.id"), nullable=True)
    uploaded_by = Column(String(50), nullable=True)
    extracted_entities_count = Column(Integer, default=0)
    status = Column(String(30), default="PROCESSED")
    created_at = Column(DateTime, default=datetime.utcnow)


class Person(Base):
    __tablename__ = "persons"

    id = Column(String(50), primary_key=True)  # e.g. P001
    case_id = Column(String(50), ForeignKey("cases.id"), nullable=True, index=True)
    source_document_id = Column(String(50), nullable=True)
    full_name = Column(String(150), nullable=False, index=True)
    aliases = Column(JSON, default=list)  # list of strings
    national_id = Column(String(50), nullable=True)
    primary_phone = Column(String(50), nullable=True)
    primary_location = Column(String(150), nullable=True)
    occupation = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_by = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String(50), primary_key=True)  # e.g. V001
    case_id = Column(String(50), ForeignKey("cases.id"), nullable=True, index=True)
    source_document_id = Column(String(50), nullable=True)
    registration_number = Column(String(50), nullable=False, index=True)
    make = Column(String(50), nullable=True)
    model = Column(String(50), nullable=True)
    color = Column(String(30), nullable=True)
    vehicle_type = Column(String(50), default="Sedan")
    registered_owner = Column(String(150), nullable=True)
    associated_person_id = Column(String(50), nullable=True)
    created_by = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class PhoneNumber(Base):
    __tablename__ = "phone_numbers"

    id = Column(String(50), primary_key=True)  # e.g. PH001
    case_id = Column(String(50), ForeignKey("cases.id"), nullable=True, index=True)
    source_document_id = Column(String(50), nullable=True)
    phone_number = Column(String(30), nullable=False, index=True)
    carrier = Column(String(50), nullable=True)
    registered_to = Column(String(150), nullable=True)
    imei = Column(String(50), nullable=True)
    created_by = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Location(Base):
    __tablename__ = "locations"

    id = Column(String(50), primary_key=True)  # e.g. LOC001
    case_id = Column(String(50), ForeignKey("cases.id"), nullable=True, index=True)
    source_document_id = Column(String(50), nullable=True)
    name = Column(String(150), nullable=False)
    address = Column(String(255), nullable=True)
    city = Column(String(100), default="New Delhi")
    state = Column(String(100), default="Delhi")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_type = Column(String(50), default="Warehouse")
    created_by = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(50), primary_key=True)  # e.g. ORG001
    case_id = Column(String(50), ForeignKey("cases.id"), nullable=True, index=True)
    source_document_id = Column(String(50), nullable=True)
    name = Column(String(150), nullable=False)
    org_type = Column(String(50), default="Logistics")
    registration_no = Column(String(50), nullable=True)
    primary_location = Column(String(150), nullable=True)
    created_by = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(50), primary_key=True)  # e.g. TX1001
    case_id = Column(String(50), ForeignKey("cases.id"), nullable=True, index=True)
    source_document_id = Column(String(50), nullable=True)
    sender_account = Column(String(50), nullable=False)
    receiver_account = Column(String(50), nullable=False)
    sender_name = Column(String(100), nullable=True)
    receiver_name = Column(String(100), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    timestamp = Column(DateTime, nullable=False)
    transaction_type = Column(String(50), default="WIRE_TRANSFER")
    anomaly_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Communication(Base):
    __tablename__ = "communications"

    id = Column(String(50), primary_key=True)  # e.g. CDR1001
    case_id = Column(String(50), ForeignKey("cases.id"), nullable=True, index=True)
    source_document_id = Column(String(50), nullable=True)
    caller_phone = Column(String(30), nullable=False, index=True)
    receiver_phone = Column(String(30), nullable=False, index=True)
    call_type = Column(String(30), default="VOICE")  # VOICE, SMS, ENCRYPTED
    duration_seconds = Column(Integer, default=0)
    timestamp = Column(DateTime, nullable=False)
    tower_location = Column(String(100), nullable=True)
    anomaly_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Event(Base):
    __tablename__ = "events"

    id = Column(String(50), primary_key=True)  # e.g. EVT1001
    case_id = Column(String(50), ForeignKey("cases.id"), nullable=True, index=True)
    source_document_id = Column(String(50), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    event_type = Column(String(50), default="INCIDENT")  # FIR, MEETING, TRANSACTION, RAID, SURVEILLANCE
    timestamp = Column(DateTime, nullable=False)
    location_name = Column(String(150), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    primary_entity_id = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(50), primary_key=True)  # e.g. ALT1001
    case_id = Column(String(50), ForeignKey("cases.id"), nullable=True, index=True)
    entity_id = Column(String(50), nullable=False, index=True)
    alert_type = Column(String(50), nullable=False)  # communication_anomaly, transaction_anomaly, geographic_anomaly, network_anomaly
    severity = Column(String(20), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(30), default="New")  # New, Under Review, Confirmed by Analyst, Dismissed
    title = Column(String(200), nullable=False)
    reasons = Column(JSON, default=list)  # list of explanatory strings
    evidence_sources = Column(JSON, default=list)  # list of IDs: CDR-1002, FIR-1023
    score = Column(Float, default=0.75)
    analyst_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(50), nullable=False, index=True)
    username = Column(String(50), nullable=True)
    action = Column(String(50), nullable=False, index=True)  # LOGIN, GRAPH_QUERY, AI_QUERY, CASE_VIEW, REPORT_GEN, EVIDENCE_VERIFIED, ALERT_UPDATE
    resource = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    metadata_json = Column(JSON, default=dict)
    ip_address = Column(String(45), default="127.0.0.1")


class EvidenceFile(Base):
    __tablename__ = "evidence_files"

    id = Column(String(50), primary_key=True)  # e.g. EV-1023
    case_id = Column(String(50), ForeignKey("cases.id"), nullable=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    sha256_hash = Column(String(64), nullable=False, index=True)
    mime_type = Column(String(100), default="application/octet-stream")
    file_size = Column(Integer, default=0)
    uploaded_by = Column(String(50), nullable=True)
    verified_status = Column(String(30), default="VERIFIED")  # VERIFIED, MISMATCH
    last_verified_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
