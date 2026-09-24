import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Case, Person, AuditLog
from app.schemas.schemas import ReportGenerateRequest, ReportResponse
from app.services.report_service import report_service
from app.services.graph_analytics import graph_analytics
from app.services.anomaly_detection import anomaly_engine
from app.utils.security import get_current_user_payload
from app.config import settings

router = APIRouter(prefix="/reports", tags=["Investigation Reports"])

@router.post("/{case_id}/generate", response_model=ReportResponse)
def generate_investigation_report(
    case_id: str,
    req: ReportGenerateRequest,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    persons = db.query(Person).filter(Person.case_id == case_id).all()
    p_dicts = [{"id": p.id, "name": p.full_name, "role": p.occupation} for p in persons]
    centrality_records = graph_analytics.compute_centrality(case_id)
    anomalies = anomaly_engine.get_case_anomalies(db, case_id)

    pdf_path = report_service.generate_case_pdf(
        case_id=case_id,
        case_info={"title": case.title, "status": case.status, "priority": case.priority},
        entities=p_dicts,
        centrality_list=centrality_records,
        anomalies=anomalies,
        analyst_notes=req.analyst_notes or "Field validation pending for recent telecom surge."
    )

    filename = os.path.basename(pdf_path)
    file_size = os.path.getsize(pdf_path)

    # Audit log
    audit = AuditLog(
        user_id=user_payload.get("user_id", "SYS"),
        username=user_payload.get("sub"),
        action="REPORT_GEN",
        resource=case_id,
        metadata_json={"filename": filename, "size_bytes": file_size}
    )
    db.add(audit)
    db.commit()

    return ReportResponse(
        report_id=filename.replace(".pdf", ""),
        case_id=case_id,
        download_url=f"/api/reports/{case_id}/download/{filename}",
        created_at=datetime.utcnow(),
        file_size_bytes=file_size
    )

@router.get("/{case_id}/download/{filename}")
def download_investigation_report(
    case_id: str,
    filename: str
):
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report file not found")

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=filename
    )
