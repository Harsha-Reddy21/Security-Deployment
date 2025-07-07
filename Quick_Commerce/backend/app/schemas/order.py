from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from ..models.order import OrderStatus, DeliveryType
from .medicine import Medicine
from .prescription import Prescription

class CartItemBase(BaseModel):
    medicine_id: int
    quantity: int = Field(..., gt=0)
    prescription_id: Optional[int] = None

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)

class CartItem(CartItemBase):
    id: int
    cart_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    medicine: Medicine
    prescription: Optional[Prescription] = None
    
    class Config:
        orm_mode = True

class Cart(BaseModel):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    cart_items: List[CartItem] = []
    
    class Config:
        orm_mode = True

class OrderItemBase(BaseModel):
    medicine_id: int
    quantity: int
    unit_price: float
    prescription_id: Optional[int] = None

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    created_at: datetime
    medicine: Medicine
    prescription: Optional[Prescription] = None
    
    class Config:
        orm_mode = True

class OrderTrackingBase(BaseModel):
    status: OrderStatus
    location: Optional[str] = None
    notes: Optional[str] = None

class OrderTrackingCreate(OrderTrackingBase):
    pass

class OrderTracking(OrderTrackingBase):
    id: int
    order_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    address_id: int
    delivery_type: DeliveryType = DeliveryType.STANDARD
    payment_method: str
    delivery_notes: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: OrderStatus
    delivery_partner_id: Optional[int] = None
    estimated_delivery_time: Optional[datetime] = None
    actual_delivery_time: Optional[datetime] = None
    payment_status: Optional[str] = None

class DeliveryProof(BaseModel):
    signature_url: Optional[str] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None

class Order(OrderBase):
    id: int
    user_id: int
    total_amount: float
    status: OrderStatus
    delivery_fee: float
    delivery_partner_id: Optional[int] = None
    estimated_delivery_time: Optional[datetime] = None
    actual_delivery_time: Optional[datetime] = None
    payment_status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    order_items: List[OrderItem] = []
    tracking_updates: List[OrderTracking] = []
    
    class Config:
        orm_mode = True

class DeliveryEstimate(BaseModel):
    address_id: int
    delivery_type: DeliveryType = DeliveryType.STANDARD
    estimated_time: datetime
    delivery_fee: float 