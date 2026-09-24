import logging
from fastapi import FastAPI, Depends, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db, Base, engine
from app.models.models import Case, Person, Document, Alert, Communication
from app.schemas.schemas import DashboardSummaryResponse, AnomalyItem
from app.api import auth, cases, entities, graph, analytics, documents, ai, reports, audit, timeline_map
from app.utils.seed import seed_database
from app.services.graph_service import graph_service
from app.services.graph_analytics import graph_analytics
from app.services.anomaly_detection import anomaly_engine

# Setup Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("crimenet")

app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_SUBTITLE,
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Structured Error Handler
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail
            }
        }
    )

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(cases.router, prefix="/api")
app.include_router(entities.router, prefix="/api")
app.include_router(graph.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(audit.router, prefix="/api")
app.include_router(timeline_map.router, prefix="/api")

@app.on_event("startup")
def on_startup():
    logger.info("Initializing CRIMENET AI Knowledge Graph & Analytics Core...")
    try:
        seed_database()
        logger.info("Database and graph verified successfully.")
    except Exception as e:
        logger.error(f"Startup initialization error: {e}")

@app.get("/api/dashboard/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    c_count = db.query(Case).count() or 3
    p_count = db.query(Person).count() or 100
    d_count = db.query(Document).count() or 100
    a_count = db.query(Alert).count() or 4
    
    g_data = graph_service.get_case_graph("CASE-2026-001", limit=1)
    r_count = g_data.get("stats", {}).get("edges_count", 54)

    clusters = graph_analytics.detect_communities("CASE-2026-001")
    cluster_count = len(clusters) or 3

    # Fetch recent alerts
    anomalies = anomaly_engine.get_case_anomalies(db, "CASE-2026-001")
    recent = [AnomalyItem(**a) for a in anomalies[:5]]

    return DashboardSummaryResponse(
        active_cases=c_count,
        total_entities=p_count,
        total_relationships=r_count,
        total_alerts=a_count,
        total_documents=d_count,
        total_clusters=cluster_count,
        recent_alerts=recent,
        entity_type_breakdown={
            "Persons": 100,
            "Vehicles": 50,
            "Phones": 75,
            "Locations": 30,
            "Organizations": 20
        },
        relationship_type_breakdown={
            "CALLED": 18,
            "OWNS": 12,
            "ASSOCIATED_WITH": 14,
            "VISITED": 8,
            "WORKS_FOR": 6
        },
        cases_over_time=[
            {"month": "Nov", "cases": 2},
            {"month": "Dec", "cases": 3},
            {"month": "Jan", "cases": 5},
            {"month": "Feb", "cases": 8},
            {"month": "Mar", "cases": 12}
        ],
        alert_trends=[
            {"day": "Mon", "alerts": 2},
            {"day": "Tue", "alerts": 4},
            {"day": "Wed", "alerts": 7},
            {"day": "Thu", "alerts": 5},
            {"day": "Fri", "alerts": 9},
            {"day": "Sat", "alerts": 6},
            {"day": "Sun", "alerts": 3}
        ]
    )

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "product": settings.APP_NAME,
        "neo4j_connected": graph_service.is_connected(),
        "graph_engine": "Neo4j Production Driver" if graph_service.is_connected() else "High-Performance In-Memory NetworkX Core",
        "demo_mode": "ACTIVE"
    }

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} Backend API",
        "docs_url": "/docs",
        "subtitle": settings.APP_SUBTITLE
    }
