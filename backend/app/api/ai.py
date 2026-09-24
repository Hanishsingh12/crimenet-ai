from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import AIChatRequest, AIChatResponse
from app.services.ollama_service import ollama_service
from app.models.models import AuditLog
from app.utils.security import get_current_user_payload
from app.config import settings

router = APIRouter(prefix="/ai", tags=["AI Investigator Assistant"])

@router.post("/chat", response_model=AIChatResponse)
def query_ai_assistant(
    req: AIChatRequest,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    case_id = req.case_id or settings.DEFAULT_CASE_ID
    res = ollama_service.query(
        question=req.message,
        case_id=case_id,
        focus_entity_id=req.focus_entity_id
    )

    # Audit log AI interaction
    audit = AuditLog(
        user_id=user_payload.get("user_id", "SYS"),
        username=user_payload.get("sub"),
        action="AI_QUERY",
        resource=case_id,
        metadata_json={
            "query": req.message[:100],
            "intent": res.get("intent"),
            "model": res.get("model_used")
        }
    )
    db.add(audit)
    db.commit()

    return res

@router.get("/status")
def get_ai_service_status(user_payload: dict = Depends(get_current_user_payload)):
    available = ollama_service.is_available()
    return {
        "service": "Ollama Local AI Inference",
        "base_url": settings.OLLAMA_BASE_URL,
        "current_model": ollama_service.model,
        "is_online": available,
        "mode": "Ollama Connected" if available else "Local Heuristic Engine (Standalone Fallback)",
        "supported_models": ["qwen2.5:7b", "llama3:8b", "mistral:7b", "gemma2:9b", "qwen3:8b"]
    }

@router.post("/model")
def update_ai_model(
    model_name: str = Body(..., embed=True),
    user_payload: dict = Depends(get_current_user_payload)
):
    ollama_service.set_model(model_name)
    return {"success": True, "active_model": ollama_service.model}
