from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..models.database import get_db
from ..models.user import User
from ..models.schemas import UserResponse, UserUpdate
from ..utils.auth import is_admin

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db), _: User = Depends(is_admin)):
    """
    Get all users - Admin only
    """
    users = db.query(User).all()
    return users

@router.put("/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int, 
    user_update: UserUpdate, 
    db: Session = Depends(get_db), 
    _: User = Depends(is_admin)
):
    """
    Update user role - Admin only
    """
    # Check if role is valid
    if user_update.role not in ["user", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'user' or 'admin'"
        )
    
    # Get user by ID
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    
    # Update role
    db_user.role = user_update.role
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int, 
    db: Session = Depends(get_db), 
    _: User = Depends(is_admin)
):
    """
    Delete user - Admin only
    """
    # Get user by ID
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    
    # Delete user
    db.delete(db_user)
    db.commit()
    return None 