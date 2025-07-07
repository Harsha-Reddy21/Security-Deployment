from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import random
import string

from ..core.database import get_db
from ..core.security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from ..models.user import User
from ..schemas.user import UserCreate, User as UserSchema, Token, UserUpdate, PhoneVerification, MedicalProfileUpdate
from ..crud import user as user_crud
from ..utils.auth import get_current_active_user

router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)

@router.post("/register", response_model=UserSchema)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    return user_crud.create_user(db=db, user=user)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = user_crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserSchema)
async def get_user_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.put("/profile", response_model=UserSchema)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return user_crud.update_user(db=db, user_id=current_user.id, user=user_update)

@router.put("/profile/medical", response_model=UserSchema)
async def update_medical_profile(
    profile: MedicalProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    user_crud.update_medical_profile(db=db, user_id=current_user.id, profile=profile)
    return current_user

@router.post("/verify-phone")
async def verify_phone_number(
    verification: PhoneVerification,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # In a real application, this would validate against a stored verification code
    # For this example, we'll just mark the phone as verified
    user_crud.verify_phone(db, current_user.id, verification.phone, verification.verification_code)
    return {"message": "Phone number verified successfully"} 