from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Alert, AuditLog
from app.schemas.schemas import CentralityResponse, ClusterResponse, AnomalyResponse, AlertStatusUpdate
from app.services.graph_analytics import graph_analytics
from app.services.anomaly_detection import anomaly_engine
from app.utils.security import get_current_user_payload

router = APIRouter(prefix="/analytics", tags=["Analytics & Anomaly Engine"])

@router.get("/centrality/{case_id}", response_model=CentralityResponse)
def get_case_centrality(
    case_id: str,
    user_payload: dict = Depends(get_current_user_payload)
):
    records = graph_analytics.compute_centrality(case_id)
    return CentralityResponse(case_id=case_id, centrality_records=records)

@router.get("/clusters/{case_id}", response_model=ClusterResponse)
def get_case_clusters(
    case_id: str,
    user_payload: dict = Depends(get_current_user_payload)
):
    clusters = graph_analytics.detect_communities(case_id)
    return ClusterResponse(case_id=case_id, clusters=clusters)

@router.get("/anomalies/{case_id}", response_model=AnomalyResponse)
def get_case_anomalies(
    case_id: str,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    anomalies = anomaly_engine.get_case_anomalies(db, case_id)
    return AnomalyResponse(case_id=case_id, anomalies=anomalies)

@router.patch("/alerts/{alert_id}")
def update_alert_status(
    alert_id: str,
    update: AlertStatusUpdate,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert record not found")

    alert.status = update.status
    if update.analyst_notes:
        alert.analyst_notes = update.analyst_notes

    # Audit log
    audit = AuditLog(
        user_id=user_payload.get("user_id", "SYS"),
        username=user_payload.get("sub"),
        action="ALERT_UPDATE",
        resource=alert_id,
        metadata_json={"new_status": update.status, "analyst": user_payload.get("sub")}
    )
    db.add(audit)
    db.commit()
    db.refresh(alert)

    return {"success": True, "alert_id": alert.id, "status": alert.status}
