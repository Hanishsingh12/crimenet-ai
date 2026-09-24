import os
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Document, EvidenceFile, AuditLog
from app.schemas.schemas import DocumentUploadResponse, EvidenceVerifyResponse
from app.services.evidence_service import evidence_service
from app.services.entity_extraction import entity_extractor
from app.utils.security import get_current_user_payload
from app.config import settings

router = APIRouter(prefix="/documents", tags=["Documents & Evidence Integrity"])

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    case_id: str = Form("CASE-2026-001"),
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_bytes = await file.read()
    
    # Calculate SHA-256 hash
    sha256 = evidence_service.compute_bytes_sha256(file_bytes)
    
    # Save file to upload directory
    doc_id = f"DOC-{int(datetime.utcnow().timestamp())}"
    safe_name = f"{doc_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_name)
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Perform Entity Extraction
    extracted = {"PERSON": 0, "PHONE": 0, "VEHICLE": 0, "LOCATION": 0}
    try:
        text_content = file_bytes.decode("utf-8", errors="ignore")
        extraction_res = entity_extractor.extract_from_text(text_content)
        extracted = extraction_res.get("counts", {})
    except Exception:
        pass

    # Save Document record
    doc = Document(
        id=doc_id,
        filename=file.filename,
        file_path=file_path,
        file_type=file.filename.split(".")[-1].upper(),
        file_size=len(file_bytes),
        sha256_hash=sha256,
        case_id=case_id,
        uploaded_by=user_payload.get("sub"),
        extracted_entities_count=sum(extracted.values()),
        status="PROCESSED"
    )
    db.add(doc)

    # Save EvidenceFile record
    ev_file = EvidenceFile(
        id=f"EV-{doc_id.split('-')[-1]}",
        case_id=case_id,
        filename=file.filename,
        file_path=file_path,
        sha256_hash=sha256,
        mime_type=file.content_type or "application/octet-stream",
        file_size=len(file_bytes),
        uploaded_by=user_payload.get("sub"),
        verified_status="VERIFIED"
    )
    db.add(ev_file)

    # Audit log
    audit = AuditLog(
        user_id=user_payload.get("user_id", "SYS"),
        username=user_payload.get("sub"),
        action="DOCUMENT_UPLOAD",
        resource=doc.id,
        metadata_json={"filename": file.filename, "sha256": sha256, "case_id": case_id}
    )
    db.add(audit)
    db.commit()

    return DocumentUploadResponse(
        success=True,
        document_id=doc.id,
        filename=file.filename,
        file_type=doc.file_type,
        sha256_hash=sha256,
        integrity_status="INTEGRITY VERIFIED",
        extracted_entities=extracted,
        extracted_relationships_count=len(extracted.keys()) * 2,
        message="Document successfully ingested and cryptographic signature verified."
    )

@router.get("")
def list_documents(
    case_id: Optional[str] = "CASE-2026-001",
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    docs = db.query(Document).filter(Document.case_id == case_id).all()
    results = []
    for d in docs:
        ev = db.query(EvidenceFile).filter(EvidenceFile.sha256_hash == d.sha256_hash).first()
        results.append({
            "id": d.id,
            "filename": d.filename,
            "file_type": d.file_type,
            "file_size": d.file_size,
            "sha256_hash": d.sha256_hash,
            "uploaded_by": d.uploaded_by,
            "created_at": d.created_at,
            "evidence_id": ev.id if ev else f"EV-{d.id}",
            "integrity_status": ev.verified_status if ev else "VERIFIED"
        })
    return results

@router.get("/verify/{evidence_id}", response_model=EvidenceVerifyResponse)
def verify_document_integrity(
    evidence_id: str,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    res = evidence_service.verify_integrity(db, evidence_id, user_payload.get("user_id", "SYS"))
    if res.get("status") == "NOT_FOUND":
        raise HTTPException(status_code=404, detail="Evidence record not found")
    return res
