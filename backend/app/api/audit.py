from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import AuditLog
from app.schemas.schemas import AuditLogResponse
from app.utils.security import get_current_user_payload

router = APIRouter(prefix="/audit-logs", tags=["Audit Trail"])

@router.get("", response_model=List[AuditLogResponse])
def get_audit_trail(
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs
