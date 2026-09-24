import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "CRIMENET AI"
    APP_SUBTITLE: str = "AI-Powered Criminal Network Analysis & Investigation Intelligence Platform"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    
    # Databases
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/crimenet")
    SQLITE_FALLBACK_URL: str = "sqlite:///./crimenet.db"
    
    # Neo4j Graph Database
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USERNAME: str = os.getenv("NEO4J_USERNAME", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "password")
    
    # Ollama Local AI Inference
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "qwen2.5:7b")
    
    # Security & Auth
    JWT_SECRET: str = os.getenv("JWT_SECRET", "sih2026-crimenet-secure-intelligence-key-99881122")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    
    # Demo Configuration
    DEFAULT_CASE_ID: str = "CASE-2026-001"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
