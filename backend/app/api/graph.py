from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import GraphDataResponse, PathRequest, PathResponse
from app.services.graph_service import graph_service
from app.models.models import AuditLog
from app.utils.security import get_current_user_payload

router = APIRouter(prefix="/graph", tags=["Graph Operations"])

@router.get("/network/{case_id}", response_model=GraphDataResponse)
def get_case_network(
    case_id: str,
    limit: int = Query(500, le=1000),
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    graph_data = graph_service.get_case_graph(case_id, limit=limit)
    
    # Audit log
    audit = AuditLog(
        user_id=user_payload.get("user_id", "SYS"),
        username=user_payload.get("sub"),
        action="GRAPH_QUERY",
        resource=case_id,
        metadata_json={"type": "FULL_NETWORK", "limit": limit}
    )
    db.add(audit)
    db.commit()

    return graph_data

@router.post("/path", response_model=PathResponse)
def find_graph_path(
    req: PathRequest,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    res = graph_service.find_shortest_path(
        source_id=req.source_id,
        target_id=req.target_id,
        max_depth=req.max_depth,
        case_id=req.case_id
    )

    # Audit log
    audit = AuditLog(
        user_id=user_payload.get("user_id", "SYS"),
        username=user_payload.get("sub"),
        action="GRAPH_QUERY",
        resource=f"{req.source_id}->{req.target_id}",
        metadata_json={"action": "SHORTEST_PATH", "found": res.get("found")}
    )
    db.add(audit)
    db.commit()

    return res

@router.get("/neighbors/{entity_id}")
def get_entity_neighbors(
    entity_id: str,
    max_depth: int = Query(1, ge=1, le=3),
    case_id: str = Query(None),
    user_payload: dict = Depends(get_current_user_payload)
):
    return graph_service.get_neighbors(entity_id, max_depth=max_depth, case_id=case_id)
