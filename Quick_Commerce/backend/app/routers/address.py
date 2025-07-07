from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..models.user import User
from ..schemas.user import Address as AddressSchema, AddressCreate, AddressUpdate
from ..crud import user as user_crud
from ..utils.auth import get_current_active_user

router = APIRouter(
    prefix="/addresses",
    tags=["addresses"]
)

@router.get("/", response_model=List[AddressSchema])
async def get_addresses(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return user_crud.get_addresses(db=db, user_id=current_user.id)

@router.post("/", response_model=AddressSchema)
async def create_address(
    address: AddressCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return user_crud.create_address(db=db, address=address, user_id=current_user.id)

@router.get("/{address_id}", response_model=AddressSchema)
async def get_address(
    address_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    address = user_crud.get_address(db=db, address_id=address_id, user_id=current_user.id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    return address

@router.put("/{address_id}", response_model=AddressSchema)
async def update_address(
    address_id: int,
    address: AddressUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return user_crud.update_address(db=db, address_id=address_id, address=address, user_id=current_user.id)

@router.delete("/{address_id}")
async def delete_address(
    address_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    user_crud.delete_address(db=db, address_id=address_id, user_id=current_user.id)
    return {"message": "Address deleted successfully"} 