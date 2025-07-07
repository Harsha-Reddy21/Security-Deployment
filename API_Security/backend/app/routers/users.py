from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from .auth import get_current_user

router = APIRouter()

class UserResponse(BaseModel):
    username: str
    email: str

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user = Depends(get_current_user)):
    return {
        "username": current_user["username"],
        "email": current_user["email"]
    }

@router.put("/me/update")
async def update_user(
    email: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    if email:
        # Sanitize input
        email = email.strip().lower()
        current_user["email"] = email
    
    return {"message": "User updated successfully"} 