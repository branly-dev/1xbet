from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models.quiz import User, UserRoleEnum
from auth import create_access_token

auth_router = APIRouter()

class TokenRequest(BaseModel):
    user_id: int

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@auth_router.post("/auth/demo-token", response_model=TokenResponse)
def get_demo_token(req: TokenRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        # Auto-create user for demo if needed
        role = UserRoleEnum.citoyen
        is_premium = False
        if req.user_id == 1:
            role = UserRoleEnum.admin
            is_premium = True
        elif req.user_id == 2:
            role = UserRoleEnum.juriste
        elif req.user_id == 4:
            is_premium = True

        user = User(
            id=req.user_id,
            full_name=f"Utilisateur Demo {req.user_id}",
            role=role,
            is_premium=is_premium
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)
