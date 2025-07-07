from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict

from ..core.database import get_db
from ..models.user import User
from ..schemas.order import Cart as CartSchema, CartItem as CartItemSchema, CartItemCreate, CartItemUpdate
from ..crud import order as order_crud
from ..utils.auth import get_current_active_user

router = APIRouter(
    prefix="/cart",
    tags=["cart"]
)

@router.get("/", response_model=CartSchema)
async def get_cart(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return order_crud.get_user_cart(db=db, user_id=current_user.id)

@router.post("/items", response_model=CartItemSchema)
async def add_to_cart(
    item: CartItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return order_crud.add_cart_item(db=db, user_id=current_user.id, item=item)

@router.put("/items/{item_id}", response_model=CartItemSchema)
async def update_cart_item(
    item_id: int,
    item: CartItemUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return order_crud.update_cart_item(db=db, cart_item_id=item_id, user_id=current_user.id, item=item)

@router.delete("/items/{item_id}")
async def remove_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    order_crud.remove_cart_item(db=db, cart_item_id=item_id, user_id=current_user.id)
    return {"message": "Item removed from cart"}

@router.delete("/")
async def clear_cart(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    order_crud.clear_cart(db=db, user_id=current_user.id)
    return {"message": "Cart cleared"}

@router.post("/validate-prescriptions", response_model=Dict)
async def validate_cart_prescriptions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return order_crud.validate_cart_prescriptions(db=db, user_id=current_user.id) 