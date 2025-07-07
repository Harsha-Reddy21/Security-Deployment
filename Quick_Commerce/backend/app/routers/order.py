from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
import json

from ..core.database import get_db
from ..models.user import User
from ..models.order import DeliveryType
from ..schemas.order import (
    Order as OrderSchema, 
    OrderCreate, 
    OrderUpdate, 
    DeliveryProof,
    OrderTracking as OrderTrackingSchema,
    OrderTrackingCreate,
    DeliveryEstimate
)
from ..crud import order as order_crud
from ..utils.auth import get_current_active_user, get_current_delivery_partner, get_current_pharmacy_admin
from ..utils.file_upload import save_upload_file, validate_image_extension

router = APIRouter(
    prefix="/orders",
    tags=["orders"]
)

@router.post("/", response_model=OrderSchema)
async def create_order(
    order: OrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return order_crud.create_order(db=db, user_id=current_user.id, order=order)

@router.get("/", response_model=List[OrderSchema])
async def get_orders(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return order_crud.get_user_orders(db=db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/{order_id}", response_model=OrderSchema)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    order = order_crud.get_order(db=db, order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if user owns the order or is admin/delivery partner
    if (order.user_id != current_user.id and 
        not current_user.is_admin and 
        not current_user.is_pharmacy_admin and 
        not (current_user.is_delivery_partner and order.delivery_partner_id == current_user.id)):
        raise HTTPException(status_code=403, detail="Not authorized to access this order")
    
    return order

@router.patch("/{order_id}/status", response_model=OrderSchema)
async def update_order_status(
    order_id: int,
    order_update: OrderUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check if user has permission to update order status
    order = order_crud.get_order(db=db, order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if (not current_user.is_admin and 
        not current_user.is_pharmacy_admin and 
        not (current_user.is_delivery_partner and order.delivery_partner_id == current_user.id)):
        raise HTTPException(status_code=403, detail="Not authorized to update this order")
    
    return order_crud.update_order_status(db=db, order_id=order_id, order_update=order_update)

@router.get("/{order_id}/track", response_model=List[OrderTrackingSchema])
async def track_order(
    order_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    order = order_crud.get_order(db=db, order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if user owns the order or is admin/delivery partner
    if (order.user_id != current_user.id and 
        not current_user.is_admin and 
        not current_user.is_pharmacy_admin and 
        not (current_user.is_delivery_partner and order.delivery_partner_id == current_user.id)):
        raise HTTPException(status_code=403, detail="Not authorized to access this order")
    
    return order_crud.get_order_tracking(db=db, order_id=order_id)

@router.post("/{order_id}/delivery-proof", response_model=OrderSchema)
async def add_delivery_proof(
    order_id: int,
    signature: Optional[UploadFile] = File(None),
    photo: Optional[UploadFile] = File(None),
    notes: Optional[str] = Form(None),
    current_user: User = Depends(get_current_delivery_partner),
    db: Session = Depends(get_db)
):
    # Check if user is assigned to this order
    order = order_crud.get_order(db=db, order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if not current_user.is_admin and order.delivery_partner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this order")
    
    # Save files if provided
    signature_url = None
    photo_url = None
    
    if signature:
        if not validate_image_extension(signature.filename):
            raise HTTPException(status_code=400, detail="Invalid signature image format")
        signature_url = await save_upload_file(signature, "delivery_proofs")
    
    if photo:
        if not validate_image_extension(photo.filename):
            raise HTTPException(status_code=400, detail="Invalid photo image format")
        photo_url = await save_upload_file(photo, "delivery_proofs")
    
    proof = DeliveryProof(
        signature_url=signature_url,
        photo_url=photo_url,
        notes=notes
    )
    
    return order_crud.add_delivery_proof(db=db, order_id=order_id, proof=proof)

# Delivery endpoints
delivery_router = APIRouter(
    prefix="/delivery",
    tags=["delivery"]
)

@delivery_router.get("/estimate", response_model=DeliveryEstimate)
async def get_delivery_estimate(
    address_id: int,
    delivery_type: DeliveryType = DeliveryType.STANDARD,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    estimate = order_crud.get_delivery_estimate(db=db, user_id=current_user.id, address_id=address_id, delivery_type=delivery_type)
    return DeliveryEstimate(
        address_id=address_id,
        delivery_type=delivery_type,
        estimated_time=estimate["estimated_time"],
        delivery_fee=estimate["delivery_fee"]
    )

@delivery_router.post("/emergency", response_model=OrderSchema)
async def create_emergency_delivery(
    order: OrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Force emergency delivery type
    order.delivery_type = DeliveryType.EMERGENCY
    return order_crud.create_order(db=db, user_id=current_user.id, order=order) 