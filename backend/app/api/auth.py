from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, AuditLog
from app.schemas.schemas import UserLogin, UserCreate, UserResponse, Token
from app.utils.security import verify_password, hash_password, create_access_token, get_current_user_payload

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == credentials.username).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")

    token_payload = {
        "sub": user.username,
        "user_id": user.id,
        "role": user.role,
        "full_name": user.full_name
    }
    access_token = create_access_token(data=token_payload)

    # Record Audit Log
    audit = AuditLog(
        user_id=user.id,
        username=user.username,
        action="LOGIN",
        resource="AUTH_SYSTEM",
        metadata_json={"role": user.role}
    )
    db.add(audit)
    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
