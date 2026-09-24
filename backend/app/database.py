import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

logger = logging.getLogger("crimenet.database")

# Connect with auto-fallback to SQLite for seamless local prototyping if PostgreSQL server is not started
engine = None
SessionLocal = None
Base = declarative_base()

def init_db_engine():
    global engine, SessionLocal
    # Try PostgreSQL first if configured
    if "postgresql" in settings.DATABASE_URL:
        try:
            test_engine = create_engine(
                settings.DATABASE_URL,
                pool_pre_ping=True,
                connect_args={"connect_timeout": 2}
            )
            with test_engine.connect() as conn:
                pass
            engine = test_engine
            logger.info("Connected to primary PostgreSQL database.")
        except Exception as e:
            logger.warning(
                f"PostgreSQL connection to {settings.DATABASE_URL} failed ({e}). "
                f"Falling back to local SQLite engine: {settings.SQLITE_FALLBACK_URL}"
            )
            engine = create_engine(
                settings.SQLITE_FALLBACK_URL,
                connect_args={"check_same_thread": False}
            )
    else:
        engine = create_engine(
            settings.DATABASE_URL,
            connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
        )

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

init_db_engine()

def get_db():
    if SessionLocal is None:
        init_db_engine()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
